import { format } from "date-fns";
import { vi } from "date-fns/locale";

const ACTION_LABELS = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  SOFT_DELETE: "Xóa",
};

const HIDDEN_OBJECTS = new Set([
  "Notification",
  "BookingDetail",
  "Guest",
  "OrderService",
  "OrderServiceDetail",
  "ServiceImage",
  "Membership",
  "AuditLog",
]);

const IGNORED_FIELDS = new Set([
  "Id",
  "CreatedAt",
  "UpdatedAt",
  "CreatedBy",
  "UpdatedBy",
  "IsDeleted",
  "ConcurrencyStamp",
  "SecurityStamp",
  "PasswordHash",
  "NormalizedUserName",
  "NormalizedEmail",
]);

const FIELD_LABEL_OVERRIDES = {
  InStockQuantity: "Tồn kho",
  inStockQuantity: "Tồn kho",
  InUseQuantity: "Đang sử dụng",
  inUseQuantity: "Đang sử dụng",
  DamagedQuantity: "Số lượng hư hỏng",
  damagedQuantity: "Số lượng hư hỏng",
};

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const HIDDEN_ROLE_NAMES = new Set(["user"]);

const isVisibleAuditActorRole = (roleName) => !HIDDEN_ROLE_NAMES.has(normalizeText(roleName));

const toActionLabel = (actionType) =>
  ACTION_LABELS[actionType] ?? actionType ?? "UNKNOWN";

const getValue = (source, ...keys) => {
  if (!source || typeof source !== "object") return undefined;

  for (const key of keys) {
    if (key in source) return source[key];
  }

  return undefined;
};

const mapFieldLabel = (fieldName) => {
  const propertyName = fieldName.split(".").pop();

  switch (propertyName) {
    case "FullName":
    case "fullName":
      return "họ tên";
    case "Email":
    case "email":
      return "email";
    case "PhoneNumber":
    case "phoneNumber":
      return "số điện thoại";
    case "RoleName":
    case "roleName":
      return "vai trò";
    case "Address":
    case "address":
      return "địa chỉ";
    case "Status":
    case "status":
      return "trạng thái";
    case "Price":
    case "price":
      return "giá";
    case "Quantity":
    case "quantity":
      return "số lượng";
    case "Name":
    case "name":
      return "tên";
    case "Description":
    case "description":
      return "mô tả";
    case "Title":
    case "title":
      return "tiêu đề";
    case "IsDeleted":
    case "isDeleted":
      return "trạng thái hiển thị";
    case "IsActive":
    case "isActive":
      return "trạng thái hoạt động";
    default:
      return propertyName;
  }
};

const getFieldLabel = (propertyName) =>
  FIELD_LABEL_OVERRIDES[propertyName] ?? mapFieldLabel(propertyName);

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const formatList = (items) => unique(items).join(", ");

const parseLogPayload = (logData) => {
  if (!logData) return [];

  try {
    const data = typeof logData === "string" ? JSON.parse(logData) : logData;
    return getValue(data, "events", "Events") ?? [];
  } catch {
    return [];
  }
};

const getEventData = (event, mode = "new") => {
  const changes = getValue(event, "changes", "Changes");
  if (!changes) return {};

  return mode === "old"
    ? getValue(changes, "oldData", "OldData") || {}
    : getValue(changes, "newData", "NewData") || {};
};

const formatValue = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Bật" : "Tắt";
  if (typeof value === "string" && !value.trim()) return "-";
  return String(value);
};

const collectChangedKeys = (oldData, newData) => {
  const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  return Array.from(keys).filter(
    (key) => !IGNORED_FIELDS.has(key) && oldData[key] !== newData[key],
  );
};

const describeChangedFields = (oldData, newData, trackedFields = []) => {
  // Chúng ta không còn hiển thị chi tiết thay đổi giá trị cũ/mới nữa để tránh rối giao diện
  // Chỉ trả về null để giao diện sạch sẽ
  return null;
};

const buildUserEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const fullName = formatValue(getValue(activeData, "fullName", "FullName"));
  const roleName = formatValue(getValue(activeData, "roleName", "RoleName"));

  const parts = [];
  if (actionType === "CREATE") {
    parts.push(`Đã tạo mới nhân viên ${fullName} (${roleName}).`);
  } else if (actionType === "DELETE" || actionType === "SOFT_DELETE") {
    parts.push(`Đã xóa nhân viên ${fullName}.`);
  } else {
    parts.push(`Sửa nhân viên ${fullName}.`);
  }

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "User",
    summary: parts[0],
    detail: message || parts.join(" "),
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

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Article",
    summary,
    detail: message || summary,
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

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Booking",
    summary,
    detail: message || summary,
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

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "RoomInventory",
    summary,
    detail: message || summary,
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

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Equipment",
    summary,
    detail: message || summary,
  };
};

const buildRoleEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const name = formatValue(getValue(activeData, "name", "Name"));

  let summary = `Vai trò ${name} đã được cập nhật.`;
  if (actionType === "CREATE") {
    summary = `Đã tạo mới vai trò ${name}.`;
  } else if (actionType === "DELETE") {
    summary = `Đã xóa vai trò ${name}.`;
  }

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Role",
    summary,
    detail: message || summary,
  };
};

const buildPermissionName = (permissionId, lookups) => {
  const perm = lookups.permissionMap?.get(permissionId);
  return perm?.name || perm?.code || `Quyền #${permissionId}`;
};

const getRoleIdFromEvent = (event, mode = "new") => {
  const data = getEventData(event, mode);
  return getValue(data, "roleId", "RoleId");
};

const getPermissionIdFromEvent = (event, mode = "new") => {
  const data = getEventData(event, mode);
  return getValue(data, "permissionId", "PermissionId");
};

const buildRolePermissionAggregateEvent = (events, lookups, fallbackEventId) => {
  const roleId = getRoleIdFromEvent(events[0]) ?? getRoleIdFromEvent(events[0], "old");
  const roleLabel = lookups.roleMap?.get(roleId)?.name || `vai trò #${roleId}`;

  const addedPermissionIds = [];
  const removedPermissionIds = [];

  events.forEach((event) => {
    const actionType = getValue(event, "actionType", "ActionType");
    if (actionType === "CREATE") {
      addedPermissionIds.push(getPermissionIdFromEvent(event));
    } else if (actionType === "DELETE") {
      removedPermissionIds.push(getPermissionIdFromEvent(event, "old"));
    }
  });

  const uniqueAddedPermissionIds = unique(addedPermissionIds);
  const uniqueRemovedPermissionIds = unique(removedPermissionIds);

  const netAddedPermissionIds = uniqueAddedPermissionIds.filter(
    (id) => !uniqueRemovedPermissionIds.includes(id),
  );
  const netRemovedPermissionIds = uniqueRemovedPermissionIds.filter(
    (id) => !uniqueAddedPermissionIds.includes(id),
  );

  const addedNames = unique(
    netAddedPermissionIds.map((permissionId) => buildPermissionName(permissionId, lookups)),
  );
  const removedNames = unique(
    netRemovedPermissionIds.map((permissionId) => buildPermissionName(permissionId, lookups)),
  );

  let summary = `Cập nhật quyền cho ${roleLabel}.`;

  return {
    eventId: fallbackEventId,
    timestamp: getValue(events[0], "timestamp", "Timestamp"),
    actionType: "UPDATE",
    actionLabel: toActionLabel("UPDATE"),
    objectName: "RolePermission",
    summary,
    detail: summary, // Chỉ hiện tóm tắt đơn giản theo ý người dùng
  };
};

const buildVoucherEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const code = formatValue(getValue(activeData, "code", "Code"));

  let summary = `Voucher ${code} đã được cập nhật.`;
  if (actionType === "CREATE") {
    summary = `Đã tạo mới voucher ${code}.`;
  } else if (actionType === "DELETE") {
    summary = `Đã xóa voucher ${code}.`;
  }

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Voucher",
    summary,
    detail: message || summary,
  };
};

const buildRoomLabel = (roomId, lookups) => {
  const room = lookups.roomMap?.get(roomId);
  return room ? `phòng ${room.roomNumber}` : `phòng #${roomId}`;
};

const buildInvoiceEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const roomNumber = getValue(activeData, "roomNumber", "RoomNumber") || "-";

  let summary = `Hóa đơn phòng ${roomNumber} đã được cập nhật.`;
  if (actionType === "CREATE") {
    summary = `Đã xuất hóa đơn cho phòng ${roomNumber}.`;
  } else if (actionType === "DELETE") {
    summary = `Hóa đơn của phòng ${roomNumber} đã bị xóa.`;
  }

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Invoice",
    summary,
    detail: message || summary,
  };
};

const buildLossAndDamageEvent = (event, rawEvents, lookups, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const roomInventoryId = getValue(activeData, "roomInventoryId", "RoomInventoryId");

  const inventoryEvent = rawEvents.find(
    (item) =>
      getValue(item, "entityType", "EntityType") === "RoomInventory" &&
      (getValue(getEventData(item), "id", "Id") === roomInventoryId ||
        getValue(getEventData(item, "old"), "id", "Id") === roomInventoryId),
  );

  const inventoryData = inventoryEvent ? getEventData(inventoryEvent) : null;
  const roomId = getValue(inventoryData, "roomId", "RoomId");
  const roomLabel = buildRoomLabel(roomId, lookups);
  const equipmentId = getValue(inventoryData, "equipmentId", "EquipmentId");
  const equipmentName = lookups.equipmentMap?.get(equipmentId)?.name || "vật tư";

  let summary = `Ghi nhận hư hỏng ${equipmentName} tại ${roomLabel}.`;
  if (actionType === "UPDATE") {
    summary = `Cập nhật hư hỏng ${equipmentName} tại ${roomLabel}.`;
  } else if (actionType === "DELETE") {
    summary = `Xóa ghi nhận hư hỏng ${equipmentName} tại ${roomLabel}.`;
  }

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "LossAndDamage",
    summary,
    detail: message || summary,
  };
};

const buildPaymentEvent = (event, rawEvents, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const activeData = actionType === "DELETE" ? oldData : newData;
  const amount = getValue(activeData, "amount", "Amount");
  const formattedAmount = amount ? new Intl.NumberFormat("vi-VN").format(amount) : "-";

  let summary = `Thanh toán số tiền ${formattedAmount}đ đã được cập nhật.`;
  if (actionType === "CREATE") {
    summary = `Đã ghi nhận thanh toán ${formattedAmount}đ.`;
  } else if (actionType === "DELETE") {
    summary = `Đã xóa thanh toán ${formattedAmount}đ.`;
  }

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "Payment",
    summary,
    detail: message || summary,
  };
};

const buildGenericEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const rawEntityType = String(getValue(event, "entityType", "EntityType") || "");
  const entityType =
    rawEntityType.charAt(0).toUpperCase() + rawEntityType.slice(1).toLowerCase();

  const name =
    getValue(newData, "name", "Name") ||
    getValue(newData, "title", "Title") ||
    getValue(oldData, "name", "Name") ||
    getValue(oldData, "title", "Title") ||
    "";

  const changedKeys = collectChangedKeys(oldData, newData);

  let summary = `${entityType} ${name} đã được cập nhật.`;
  if (actionType === "CREATE") {
    summary = `Đã tạo mới ${entityType} ${name}.`;
  } else if (actionType === "DELETE") {
    summary = `Đã xóa ${entityType} ${name}.`;
  } else if (changedKeys.includes("IsDeleted")) {
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

  const message = getValue(event, "message", "Message");

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: entityType || "System",
    summary,
    detail: message || summary,
  };
};

const buildEvent = (event, rawEvents, lookups, fallbackEventId) => {
  const rawEntityType = String(getValue(event, "entityType", "EntityType") || "");
  // Normalize to PascalCase (e.g., "user" -> "User")
  const entityType =
    rawEntityType.length > 0
      ? rawEntityType.charAt(0).toUpperCase() + rawEntityType.slice(1).toLowerCase()
      : "";

  switch (entityType) {
    case "Lossanddamage":
    case "LossAndDamage":
      return buildLossAndDamageEvent(event, rawEvents, lookups, fallbackEventId);
    case "User":
      return buildUserEvent(event, fallbackEventId);
    case "Article":
      return buildArticleEvent(event, fallbackEventId);
    case "Booking":
      return buildBookingEvent(event, rawEvents, lookups, fallbackEventId);
    case "Roominventory":
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
  lookups = {
    roomMap: new Map(),
    equipmentMap: new Map(),
    roleMap: new Map(),
    permissionMap: new Map(),
  },
) => {
  const logData = getValue(log, "logData", "LogData");
  const rawEvents = parseLogPayload(logData);

  const logId = getValue(log, "id", "Id");

  // Gộp RolePermission theo từng lần lưu (cùng timestamp tính đến giây)
  const rpGroups = rawEvents
    .filter((event) => getValue(event, "entityType", "EntityType") === "RolePermission")
    .reduce((acc, event) => {
      const fullTs = getValue(event, "timestamp", "Timestamp") || "";
      // Truncate to seconds (e.g., "2024-05-12T19:56:28.123Z" -> "2024-05-12T19:56:28")
      const ts = fullTs.split(".")[0];
      if (!acc[ts]) acc[ts] = [];
      acc[ts].push(event);
      return acc;
    }, {});

  const rolePermissionEvents = Object.values(rpGroups).map((group, index) =>
    buildRolePermissionAggregateEvent(group, lookups, `${logId}-rp-${index}`),
  );

  const nonRolePermissionEvents = rawEvents.filter((event) => {
    const type = getValue(event, "entityType", "EntityType");
    return !HIDDEN_OBJECTS.has(type) && type !== "RolePermission";
  });

  const normalizedEvents = [
    ...nonRolePermissionEvents.map((event, index) =>
      buildEvent(event, rawEvents, lookups, `${logId}-${index}`),
    ),
    ...rolePermissionEvents,
  ].filter((event) => event && !HIDDEN_OBJECTS.has(event.objectName));

  return {
    id: logId || Math.random(),
    userId: getValue(log, "userId", "UserId"),
    userName: getValue(log, "userName", "UserName") || "Hệ thống",
    roleName: getValue(log, "roleName", "RoleName") || "Hệ thống",
    logDate: getValue(log, "logDate", "LogDate"),
    events: normalizedEvents || [],
    summary: normalizedEvents?.[0]?.summary || "Nhật ký hoạt động hệ thống.",
  };
};

export const groupAuditLogs = (logs, formatDate) => {
  const grouped = new Map();

  if (!Array.isArray(logs)) return [];

  logs.forEach((log) => {
    const events = log.events || [];
    if (events.length === 0) return;

    const dateLabel = log.logDate ? formatDate(log.logDate) : "Không rõ ngày";
    const userId = log.userId || "0";
    const userName = log.userName || "Hệ thống";
    const roleName = log.roleName || "Hệ thống";

    const key = `${dateLabel}-${userId}-${userName}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        dateLabel,
        userName,
        roleName,
        events: [],
      });
    }

    grouped.get(key).events.push(...events);
  });

  return Array.from(grouped.values()).map((group) => {
    const events = [...group.events].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    return {
      ...group,
      events,
      summary: events[0]?.summary || "Nhật ký hoạt động hệ thống.",
    };
  });
};

export const filterAuditLogs = (logs, filters) => {
  if (!Array.isArray(logs)) return [];

  return logs.filter((log) => {
    if (!isVisibleAuditActorRole(log.roleName)) {
      return false;
    }

    const nameMatch =
      !filters.employeeName ||
      normalizeText(log.userName).includes(normalizeText(filters.employeeName));

    const roleMatch =
      !filters.roleName || normalizeText(log.roleName) === normalizeText(filters.roleName);

    if (!log.logDate) return nameMatch && roleMatch;

    const logDate = new Date(log.logDate);
    const fromMatch = !filters.fromDate || logDate >= new Date(`${filters.fromDate}T00:00:00`);
    const toMatch = !filters.toDate || logDate < new Date(`${filters.toDate}T23:59:59.999`);

    return nameMatch && roleMatch && fromMatch && toMatch;
  });
};

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
