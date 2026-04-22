const ACTION_LABELS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  SOFT_DELETE: "SOFT_DELETE",
};

const HIDDEN_OBJECTS = new Set([
  "Notification",
  "BookingDetail",
  "Guest",
  "OrderService",
  "OrderServiceDetail",
  "Room",
]);

const IGNORED_FIELDS = new Set([
  "Id",
  "CreatedAt",
  "UpdatedAt",
  "DeletedAt",
  "PasswordHash",
  "ImageUrl",
  "GoogleId",
  "AvatarUrl",
  "ThumbnailUrl",
  "GalleryUrls",
  "Slug",
  "Summary",
  "Tags",
  "PublishedAt",
  "ApprovedAt",
]);

const getValue = (source, ...keys) => {
  if (!source || typeof source !== "object") return undefined;

  for (const key of keys) {
    if (key in source) return source[key];
  }

  return undefined;
};

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toActionLabel = (actionType) =>
  ACTION_LABELS[actionType] ?? actionType ?? "UNKNOWN";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toLocaleString("vi-VN");
  }
  return String(value);
};

const mapFieldLabel = (propertyName) => {
  switch (propertyName) {
    case "RoomNumber":
      return "số phòng";
    case "Floor":
      return "tầng";
    case "Status":
      return "trạng thái";
    case "CleaningStatus":
      return "tình trạng dọn phòng";
    case "Quantity":
      return "số lượng";
    case "PenaltyAmount":
      return "mức đền bù";
    case "Description":
      return "mô tả";
    case "PriceIfLost":
      return "giá đền bù";
    case "FullName":
      return "họ tên";
    case "Email":
      return "email";
    case "Phone":
      return "số điện thoại";
    case "Name":
      return "tên";
    case "BookingCode":
      return "mã booking";
    case "RoleId":
      return "vai trò";
    case "Content":
      return "nội dung";
    case "Title":
      return "tiêu đề";
    case "IsDeleted":
      return "trạng thái hiển thị";
    case "IsActive":
      return "trạng thái hoạt động";
    default:
      return propertyName;
  }
};

const FIELD_LABEL_OVERRIDES = {
  InStockQuantity: "Tồn kho",
  inStockQuantity: "Tồn kho",
  InUseQuantity: "Đang sử dụng",
  inUseQuantity: "Đang sử dụng",
  DamagedQuantity: "Số lượng hư hỏng",
  damagedQuantity: "Số lượng hư hỏng",
};

const getFieldLabel = (propertyName) =>
  FIELD_LABEL_OVERRIDES[propertyName] ?? mapFieldLabel(propertyName);

const parseLogPayload = (logData) => {
  if (!logData) return [];

  try {
    const parsed = JSON.parse(logData);
    return getValue(parsed, "events", "Events") ?? [];
  } catch {
    return [];
  }
};

const getEventData = (event, mode = "new") => {
  const changes = getValue(event, "changes", "Changes");
  if (!changes) return {};

  if (mode === "old") {
    return getValue(changes, "oldData", "OldData") ?? {};
  }

  return getValue(changes, "newData", "NewData") ?? {};
};

const collectChangedKeys = (oldData, newData) =>
  Array.from(new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})])).filter(
    (key) =>
      !IGNORED_FIELDS.has(key) && formatValue(oldData?.[key]) !== formatValue(newData?.[key]),
  );

const describeChangedFields = (oldData, newData, preferredKeys = null) => {
  const changedKeys = collectChangedKeys(oldData, newData);
  const keys = preferredKeys
    ? preferredKeys.filter((key) => changedKeys.includes(key))
    : changedKeys;

  const changes = keys.map((key) => {
    const oldValue = formatValue(oldData?.[key]);
    const newValue = formatValue(newData?.[key]);
    return `${getFieldLabel(key)}: ${oldValue} -> ${newValue}`;
  });

  return changes.length ? `Thay đổi: ${changes.join("; ")}.` : "";
};

const buildRoomLabel = (roomId, lookups, fallbackRoomNumber = null) => {
  const room = roomId ? lookups.roomMap?.get(roomId) : null;
  if (room?.roomNumber && room?.roomTypeName) {
    return `${room.roomNumber} - ${room.roomTypeName}`;
  }
  if (room?.roomNumber) {
    return room.roomNumber;
  }
  return fallbackRoomNumber ?? (roomId ? `phòng ${roomId}` : "phòng chưa xác định");
};

const buildEquipmentAndRoomContext = (rawEvents, lookups) => {
  const roomInventoryEvent = rawEvents.find(
    (item) => getValue(item, "entityType", "EntityType") === "RoomInventory",
  );
  const equipmentEvent = rawEvents.find(
    (item) => getValue(item, "entityType", "EntityType") === "Equipment",
  );
  const bookingDetailEvent = rawEvents.find(
    (item) => getValue(item, "entityType", "EntityType") === "BookingDetail",
  );

  const roomInventoryData = getEventData(roomInventoryEvent);
  const bookingDetailData = getEventData(bookingDetailEvent);
  const roomId =
    getValue(roomInventoryData, "roomId", "RoomId") ??
    getValue(bookingDetailData, "roomId", "RoomId");
  const equipmentId = getValue(roomInventoryData, "equipmentId", "EquipmentId");

  return {
    roomId,
    roomLabel: buildRoomLabel(
      roomId,
      lookups,
      getValue(roomInventoryData, "roomNumber", "RoomNumber"),
    ),
    equipmentId,
    equipmentName:
      lookups.equipmentMap?.get(equipmentId)?.name ??
      getValue(getEventData(equipmentEvent), "name", "Name") ??
      getValue(roomInventoryData, "itemType", "ItemType") ??
      null,
    bookingCode: getValue(getEventData(rawEvents.find(
      (item) => getValue(item, "entityType", "EntityType") === "Booking",
    )), "bookingCode", "BookingCode"),
  };
};

const buildLossAndDamageEvent = (event, rawEvents, lookups, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const data = actionType === "DELETE" ? getEventData(event, "old") : getEventData(event);
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const context = buildEquipmentAndRoomContext(rawEvents, lookups);

  const equipmentName =
    context.equipmentName ?? getValue(data, "description", "Description") ?? "thiết bị";
  const quantity = formatValue(getValue(data, "quantity", "Quantity"));
  const penalty = getValue(data, "penaltyAmount", "PenaltyAmount");
  const description = getValue(data, "description", "Description");

  let summary = "";
  if (actionType === "CREATE") {
    summary = `Đã báo cáo ${context.roomLabel} bị hư ${equipmentName} số lượng ${quantity}.`;
  } else if (actionType === "DELETE") {
    summary = `Đã hủy báo cáo đền bù ${equipmentName} tại ${context.roomLabel}.`;
  } else {
    summary = `Đã cập nhật báo cáo hư hỏng ${equipmentName} tại ${context.roomLabel}.`;
  }

  const parts = [summary];
  if (penalty !== undefined && penalty !== null) {
    parts.push(`Mức đền bù: ${formatValue(penalty)}.`);
  }
  if (description) {
    parts.push(`Mô tả: ${description}.`);
  }

  const changedFields = describeChangedFields(oldData, newData, [
    "Quantity",
    "PenaltyAmount",
    "Description",
  ]);
  if (changedFields && actionType === "UPDATE") {
    parts.push(changedFields);
  }

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "LossAndDamage",
    summary,
    detail: parts.join(" "),
  };
};

const buildUserEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const fullName = formatValue(getValue(activeData, "fullName", "FullName"));
  const changedKeys = collectChangedKeys(oldData, newData);

  let summary = `Tài khoản ${fullName}`;
  const parts = [];

  if (changedKeys.includes("Status")) {
    const newStatus = getValue(newData, "status", "Status");
    summary += newStatus ? " đã được khôi phục." : " đã bị ẩn.";
    parts.push(summary);
  } else if (changedKeys.includes("RoleId")) {
    summary += " đã được cập nhật vai trò.";
    parts.push(summary);
  } else if (changedKeys.includes("Email")) {
    summary += " đã cập nhật email.";
    parts.push(summary);
  } else if (changedKeys.includes("Phone")) {
    summary += " đã cập nhật số điện thoại.";
    parts.push(summary);
  } else {
    summary += " đã được cập nhật.";
    parts.push(summary);
  }

  const changedFields = describeChangedFields(oldData, newData, [
    "Email",
    "Phone",
    "DateOfBirth",
    "RoleId",
    "Status",
    "FullName",
  ]);
  if (changedFields) {
    parts.push(changedFields);
  }

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "User",
    summary: parts[0],
    detail: parts.join(" "),
  };
};

const buildArticleEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const title = formatValue(getValue(activeData, "title", "Title"));
  const changedKeys = collectChangedKeys(oldData, newData);

  let summary = `Bài viết ${title}`;
  if (changedKeys.includes("IsDeleted")) {
    const isDeleted = getValue(newData, "isDeleted", "IsDeleted");
    summary += isDeleted ? " đã bị ẩn." : " đã được khôi phục.";
  } else if (changedKeys.includes("Status")) {
    const status = getValue(newData, "status", "Status");
    summary += status ? " đã được hiển thị." : " đã bị ẩn.";
  } else if (actionType === "CREATE") {
    summary = `Đã tạo bài viết ${title}.`;
  } else {
    summary += " đã được chỉnh sửa.";
  }

  const changedFields = describeChangedFields(oldData, newData, [
    "Title",
    "Content",
    "Status",
    "IsDeleted",
  ]);

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Article",
    summary,
    detail: changedFields ? `${summary} ${changedFields}` : summary,
  };
};

const buildBookingEvent = (event, rawEvents, lookups, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const bookingCode =
    formatValue(getValue(newData, "bookingCode", "BookingCode")) !== "-"
      ? formatValue(getValue(newData, "bookingCode", "BookingCode"))
      : formatValue(getValue(oldData, "bookingCode", "BookingCode"));

  const bookingDetailEvent = rawEvents.find(
    (item) => getValue(item, "entityType", "EntityType") === "BookingDetail",
  );
  const bookingDetailData = getEventData(bookingDetailEvent);
  const roomId = getValue(bookingDetailData, "roomId", "RoomId");
  const roomLabel = buildRoomLabel(roomId, lookups);

  let summary = `Đã đặt phòng ${roomLabel} có mã booking là ${bookingCode}.`;
  if (actionType === "UPDATE") {
    summary = `Booking ${bookingCode} đã được cập nhật.`;
  } else if (actionType === "DELETE") {
    summary = `Booking ${bookingCode} đã bị hủy.`;
  }

  const changedFields = describeChangedFields(oldData, newData, ["Status", "VoucherId"]);

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Booking",
    summary,
    detail: changedFields ? `${summary} ${changedFields}` : summary,
  };
};

const buildRoomInventoryEvent = (event, rawEvents, lookups, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const roomId = getValue(activeData, "roomId", "RoomId");
  const roomLabel = buildRoomLabel(roomId, lookups);
  const equipmentId = getValue(activeData, "equipmentId", "EquipmentId");
  const equipmentName =
    lookups.equipmentMap?.get(equipmentId)?.name ??
    formatValue(getValue(activeData, "itemType", "ItemType"));

  const changedKeys = collectChangedKeys(oldData, newData);
  let summary = `Vật tư ${equipmentName} tại ${roomLabel} đã được cập nhật.`;

  if (changedKeys.includes("IsActive")) {
    const isActive = getValue(newData, "isActive", "IsActive");
    summary = isActive
      ? `${equipmentName} tại ${roomLabel} đã được khôi phục.`
      : `${equipmentName} tại ${roomLabel} đã bị ẩn.`;
  }

  const changedFields = describeChangedFields(oldData, newData, [
    "Quantity",
    "IsActive",
    "PriceIfLost",
    "Note",
  ]);

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "RoomInventory",
    summary,
    detail: changedFields ? `${summary} ${changedFields}` : summary,
  };
};

const buildEquipmentEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const name = formatValue(getValue(activeData, "name", "Name"));
  const changedKeys = collectChangedKeys(oldData, newData);

  let summary = `Thiết bị ${name} đã được cập nhật.`;
  if (changedKeys.includes("IsActive")) {
    const isActive = getValue(newData, "isActive", "IsActive");
    summary = isActive ? `Thiết bị ${name} đã được khôi phục.` : `Thiết bị ${name} đã bị ẩn.`;
  }

  const changedFields = describeChangedFields(oldData, newData, [
    "Name",
    "InStockQuantity",
    "InUseQuantity",
    "DamagedQuantity",
    "DefaultPriceIfLost",
    "IsActive",
  ]);

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Equipment",
    summary,
    detail: changedFields ? `${summary} ${changedFields}` : summary,
  };
};

const buildRoleEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const roleName = formatValue(getValue(activeData, "name", "Name"));
  const summary =
    actionType === "DELETE"
      ? `Role "${roleName}" đã bị xóa.`
      : `Role "${roleName}" đã được cập nhật.`;
  const changedFields =
    actionType === "DELETE"
      ? ""
      : describeChangedFields(oldData, newData, ["Name", "Description"]);

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Role",
    summary,
    detail: changedFields ? `${summary} ${changedFields}` : summary,
  };
};

const buildVoucherEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const code = formatValue(getValue(activeData, "Code", "code"));
  const voucherId = formatValue(
    getValue(activeData, "VoucherId", "voucherId") ?? getValue(activeData, "Id", "id"),
  );
  const dispatchType = getValue(activeData, "DispatchType", "dispatchType");
  const sentCount = getValue(activeData, "SentCount", "sentCount");
  const recipients = getValue(activeData, "Recipients", "recipients");
  const message = getValue(event, "message", "Message");

  let summary = message || `Voucher ${code} có id ${voucherId} đã được gửi đi.`;
  const parts = [summary];

  if (dispatchType) {
    parts.push(`Hình thức gửi: ${dispatchType}.`);
  }

  if (sentCount !== undefined && sentCount !== null) {
    parts.push(`Số lượt gửi thành công: ${sentCount}.`);
  }

  if (Array.isArray(recipients) && recipients.length > 0) {
    parts.push(`Người nhận: ${recipients.join(", ")}.`);
  }

  const changedFields = describeChangedFields(oldData, newData);
  if (changedFields) {
    parts.push(changedFields);
  }

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Voucher",
    summary,
    detail: parts.join(" "),
  };
};

const buildInvoiceEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const invoiceId = formatValue(getValue(activeData, "Id", "id", "InvoiceId", "invoiceId"));
  const roomNumber = formatValue(getValue(activeData, "RoomNumber", "roomNumber"));

  let summary = `Đã tạo hóa đơn cho phòng ${roomNumber}.`;
  if (actionType === "UPDATE") {
    summary = `Hóa đơn của phòng ${roomNumber} đã được cập nhật.`;
  } else if (actionType === "DELETE") {
    summary = `Hóa đơn của phòng ${roomNumber} đã bị xóa.`;
  }

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Invoice",
    summary,
    detail: summary,
  };
};

const buildPaymentEvent = (event, rawEvents, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const amountPaid = formatValue(getValue(activeData, "AmountPaid", "amountPaid"));
  const transactionCode = formatValue(
    getValue(activeData, "TransactionCode", "transactionCode"),
  );
  const status = formatValue(getValue(activeData, "Status", "status"));
  const invoiceId = formatValue(getValue(activeData, "InvoiceId", "invoiceId"));
  const relatedInvoiceEvent = rawEvents.find(
    (item) => getValue(item, "entityType", "EntityType") === "Invoice",
  );
  const relatedInvoiceData = getEventData(relatedInvoiceEvent);
  const roomNumber = formatValue(getValue(relatedInvoiceData, "RoomNumber", "roomNumber"));

  const paymentTarget =
    roomNumber !== "-"
      ? `hóa đơn của phòng ${roomNumber}`
      : invoiceId !== "-"
        ? `hóa đơn ${invoiceId}`
        : transactionCode !== "-"
          ? `mã ${transactionCode}`
          : "giao dịch";

  let summary = `Thanh toán ${paymentTarget} đã thành công.`;

  if (status !== "-" && status !== "Completed") {
    summary = `Thanh toán ${paymentTarget} ở trạng thái ${status}.`;
  }

  if (actionType === "DELETE") {
    summary = `Thanh toán ${paymentTarget} đã bị xóa.`;
  }

  const detailParts = [summary];
  if (amountPaid !== "-") {
    detailParts.push(`Số tiền: ${amountPaid}.`);
  }

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Payment",
    summary,
    detail: detailParts.join(" "),
  };
};

const buildGenericEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const entityType = getValue(event, "entityType", "EntityType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const name =
    formatValue(getValue(activeData, "name", "Name")) !== "-"
      ? formatValue(getValue(activeData, "name", "Name"))
      : formatValue(getValue(activeData, "title", "Title"));

  const changedKeys = collectChangedKeys(oldData, newData);
  let summary = `${entityType} ${name !== "-" ? name : ""} đã được cập nhật.`.trim();

  if (changedKeys.includes("IsDeleted")) {
    const isDeleted = getValue(newData, "isDeleted", "IsDeleted");
    summary = isDeleted
      ? `${entityType} ${name} đã bị ẩn.`
      : `${entityType} ${name} đã được khôi phục.`;
  } else if (changedKeys.includes("IsActive")) {
    const isActive = getValue(newData, "isActive", "IsActive");
    summary = isActive
      ? `${entityType} ${name} đã được khôi phục.`
      : `${entityType} ${name} đã bị ẩn.`;
  }

  const changedFields = describeChangedFields(oldData, newData);

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: entityType || "System",
    summary,
    detail: changedFields ? `${summary} ${changedFields}` : summary,
  };
};

const buildEvent = (event, rawEvents, lookups, fallbackEventId) => {
  const entityType = getValue(event, "entityType", "EntityType");

  switch (entityType) {
    case "LossAndDamage":
      return buildLossAndDamageEvent(event, rawEvents, lookups, fallbackEventId);
    case "User":
      return buildUserEvent(event, fallbackEventId);
    case "Article":
      return buildArticleEvent(event, fallbackEventId);
    case "Booking":
      return buildBookingEvent(event, rawEvents, lookups, fallbackEventId);
    case "RoomInventory":
      return buildRoomInventoryEvent(event, rawEvents, lookups, fallbackEventId);
    case "Equipment":
      return buildEquipmentEvent(event, fallbackEventId);
    case "Role":
      return buildRoleEvent(event, fallbackEventId);
    case "Voucher":
      return buildVoucherEvent(event, fallbackEventId);
    case "Invoice":
      return buildInvoiceEvent(event, fallbackEventId);
    case "Payment":
      return buildPaymentEvent(event, rawEvents, fallbackEventId);
    default:
      return buildGenericEvent(event, fallbackEventId);
  }
};

export const normalizeAuditLog = (
  log,
  lookups = { roomMap: new Map(), equipmentMap: new Map() },
) => {
  const rawEvents = parseLogPayload(log.logData);
  const normalizedEvents = rawEvents
    .map((event, index) => buildEvent(event, rawEvents, lookups, `${log.id}-${index}`))
    .filter((event) => !HIDDEN_OBJECTS.has(event.objectName));

  return {
    id: log.id,
    userId: log.userId,
    userName: log.userName || "System",
    roleName: log.roleName || "System",
    logDate: log.logDate,
    events: normalizedEvents,
    summary:
      normalizedEvents[0]?.summary || "Chưa có nội dung chi tiết cho nhóm nhật ký này.",
  };
};

export const groupAuditLogs = (logs, formatDate) => {
  const grouped = new Map();

  logs.forEach((log) => {
    if (!log.events?.length) return;

    const dateLabel = formatDate(log.logDate);
    const key = `${dateLabel}-${log.userId ?? log.userName}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        dateLabel,
        userName: log.userName,
        roleName: log.roleName,
        events: [],
      });
    }

    grouped.get(key).events.push(...log.events);
  });

  return Array.from(grouped.values()).map((group) => {
    const events = [...group.events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return {
      ...group,
      events,
      summary:
        events[0]?.summary || "Chưa có nội dung chi tiết cho nhóm nhật ký này.",
    };
  });
};

export const filterAuditLogs = (logs, filters) =>
  logs.filter((log) => {
    const nameMatch =
      !filters.employeeName ||
      normalizeText(log.userName).includes(normalizeText(filters.employeeName));

    const roleMatch =
      !filters.roleName || normalizeText(log.roleName) === normalizeText(filters.roleName);

    const logDate = new Date(log.logDate);
    const fromMatch =
      !filters.fromDate || logDate >= new Date(`${filters.fromDate}T00:00:00`);
    const toMatch =
      !filters.toDate || logDate < new Date(`${filters.toDate}T23:59:59.999`);

    return nameMatch && roleMatch && fromMatch && toMatch;
  });

const escapeXml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const downloadAuditSpreadsheet = (logs, fileName = "audit-log.xlsx") => {
  const rows = logs.flatMap((log) =>
    log.events.map((event) => ({
      logDate: new Date(log.logDate).toLocaleDateString("vi-VN"),
      userName: log.userName,
      roleName: log.roleName,
      time: new Date(event.timestamp).toLocaleString("vi-VN"),
      action: event.actionLabel,
      object: event.objectName,
      detail: event.detail,
    })),
  );

  const xml = [
    '<?xml version="1.0"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    "<Styles>",
    '<Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E7F0FF" ss:Pattern="Solid"/></Style>',
    '<Style ss:ID="Wrap"><Alignment ss:Vertical="Top" ss:WrapText="1"/></Style>',
    "</Styles>",
    '<Worksheet ss:Name="AuditLogs"><Table>',
    '<Row ss:StyleID="Header">',
    '<Cell><Data ss:Type="String">Ngày lưu log</Data></Cell>',
    '<Cell><Data ss:Type="String">Tên</Data></Cell>',
    '<Cell><Data ss:Type="String">Vai trò</Data></Cell>',
    '<Cell><Data ss:Type="String">Thời gian</Data></Cell>',
    '<Cell><Data ss:Type="String">Hành động</Data></Cell>',
    '<Cell><Data ss:Type="String">Đối tượng</Data></Cell>',
    '<Cell><Data ss:Type="String">Nội dung chi tiết</Data></Cell>',
    "</Row>",
    ...rows.map(
      (row) => `
        <Row>
          <Cell><Data ss:Type="String">${escapeXml(row.logDate)}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(row.userName)}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(row.roleName)}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(row.time)}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(row.action)}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(row.object)}</Data></Cell>
          <Cell ss:StyleID="Wrap"><Data ss:Type="String">${escapeXml(row.detail)}</Data></Cell>
        </Row>`,
    ),
    "</Table></Worksheet></Workbook>",
  ].join("");

  const blob = new Blob([xml], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};
