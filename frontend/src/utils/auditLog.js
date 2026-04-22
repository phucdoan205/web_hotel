const ACTION_LABELS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  SOFT_DELETE: "SOFT_DELETE",
};

const IGNORED_FIELDS = new Set([
  "Id",
  "CreatedAt",
  "UpdatedAt",
  "DeletedAt",
  "PasswordHash",
  "ImageUrl",
  "GoogleId",
  "AvatarUrl",
]);

const getValue = (source, ...keys) => {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  for (const key of keys) {
    if (key in source) {
      return source[key];
    }
  }

  return undefined;
};

const toActionLabel = (actionType) =>
  ACTION_LABELS[actionType] ?? actionType ?? "UNKNOWN";

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const mapFieldLabel = (propertyName) => {
  switch (propertyName) {
    case "RoomNumber":
      return "Số phòng";
    case "Floor":
      return "Tầng";
    case "Status":
      return "Trạng thái";
    case "CleaningStatus":
      return "Tình trạng dọn phòng";
    case "Quantity":
      return "Số lượng";
    case "PenaltyAmount":
      return "Mức đền bù";
    case "Description":
      return "Mô tả";
    case "PriceIfLost":
      return "Giá đền bù";
    case "FullName":
      return "Họ tên";
    case "Email":
      return "Email";
    case "Phone":
      return "Số điện thoại";
    case "Name":
      return "Tên";
    case "BookingCode":
      return "Mã đặt phòng";
    case "CheckInDate":
      return "Ngày nhận phòng";
    case "CheckOutDate":
      return "Ngày trả phòng";
    case "InUseQuantity":
      return "Đang sử dụng";
    case "InStockQuantity":
      return "Tồn kho";
    case "DamagedQuantity":
      return "Số lượng hư hỏng";
    case "ItemType":
      return "Vật dụng";
    case "RoleId":
      return "Vai trò";
    case "IsRead":
      return "Đã đọc";
    case "ReferenceLink":
      return "Liên kết";
    case "Title":
      return "Tiêu đề";
    case "Type":
      return "Loại";
    default:
      return propertyName;
  }
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Có" : "Không";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toLocaleString("vi-VN");
  }

  return String(value);
};

const parseLogPayload = (logData) => {
  if (!logData) {
    return [];
  }

  try {
    const parsed = JSON.parse(logData);
    return getValue(parsed, "events", "Events") ?? [];
  } catch {
    return [];
  }
};

const getEventData = (event, mode = "new") => {
  const changes = getValue(event, "changes", "Changes");

  if (!changes) {
    return {};
  }

  if (mode === "old") {
    return getValue(changes, "oldData", "OldData") ?? {};
  }

  return getValue(changes, "newData", "NewData") ?? {};
};

const describeChangedFields = (oldData, newData) => {
  const allKeys = Array.from(
    new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]),
  ).filter((key) => !IGNORED_FIELDS.has(key));

  const changes = allKeys
    .map((key) => {
      const oldValue = formatValue(oldData?.[key]);
      const newValue = formatValue(newData?.[key]);

      if (oldValue === newValue) {
        return null;
      }

      return `${mapFieldLabel(key)}: ${oldValue} -> ${newValue}`;
    })
    .filter(Boolean);

  return changes.length ? `Thay đổi: ${changes.join("; ")}.` : "";
};

const describeSnapshot = (data) => {
  const entries = Object.entries(data || {})
    .filter(([key, value]) => !IGNORED_FIELDS.has(key) && value !== null && value !== undefined && value !== "")
    .slice(0, 4)
    .map(([key, value]) => `${mapFieldLabel(key)}: ${formatValue(value)}`);

  return entries.length ? `Chi tiết: ${entries.join("; ")}.` : "";
};

const buildEquipmentAndRoomContext = (rawEvents, lookups) => {
  const roomInventoryEvent = rawEvents.find((item) =>
    getValue(item, "entityType", "EntityType") === "RoomInventory",
  );
  const equipmentEvent = rawEvents.find((item) =>
    getValue(item, "entityType", "EntityType") === "Equipment",
  );

  const roomInventoryData = getEventData(roomInventoryEvent);
  const roomId = getValue(roomInventoryData, "roomId", "RoomId");
  const equipmentId = getValue(roomInventoryData, "equipmentId", "EquipmentId");

  return {
    roomId,
    roomNumber:
      lookups.roomMap?.get(roomId)?.roomNumber ??
      getValue(roomInventoryData, "roomNumber", "RoomNumber") ??
      (roomId ? `phòng ${roomId}` : null),
    equipmentId,
    equipmentName:
      lookups.equipmentMap?.get(equipmentId)?.name ??
      getValue(getEventData(equipmentEvent), "name", "Name") ??
      getValue(roomInventoryData, "itemType", "ItemType") ??
      null,
  };
};

const buildLossAndDamageEvent = (event, rawEvents, lookups, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const data = actionType === "DELETE" ? getEventData(event, "old") : getEventData(event);
  const oldData = getEventData(event, "old");
  const context = buildEquipmentAndRoomContext(rawEvents, lookups);

  const equipmentName = context.equipmentName ?? getValue(data, "description", "Description") ?? "vật dụng";
  const roomLabel = context.roomNumber ? `tại ${context.roomNumber}` : "";
  const quantity = formatValue(getValue(data, "quantity", "Quantity"));
  const penalty = getValue(data, "penaltyAmount", "PenaltyAmount");
  const description = getValue(data, "description", "Description");

  let summary = "";
  if (actionType === "CREATE") {
    summary = `Ghi nhận hỏng ${equipmentName} ${roomLabel}`.trim();
  } else if (actionType === "DELETE") {
    summary = `Hủy báo cáo đền bù ${equipmentName} ${roomLabel}`.trim();
  } else {
    summary = `Cập nhật báo cáo hư hỏng ${equipmentName} ${roomLabel}`.trim();
  }

  const parts = [`${summary}.`];

  if (quantity !== "-") {
    parts.push(`Số lượng: ${quantity}.`);
  }

  if (penalty !== undefined && penalty !== null) {
    parts.push(`Mức đền bù: ${formatValue(penalty)}.`);
  }

  if (description) {
    parts.push(`Mô tả: ${description}.`);
  }

  const changedFields = describeChangedFields(oldData, getEventData(event));
  if (changedFields && actionType === "UPDATE") {
    parts.push(changedFields);
  }

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: "LossAndDamage",
    summary: `${summary}.`,
    detail: parts.join(" "),
  };
};

const buildGenericEvent = (event, fallbackEventId) => {
  const actionType = getValue(event, "actionType", "ActionType");
  const entityType = getValue(event, "entityType", "EntityType");
  const oldData = getEventData(event, "old");
  const newData = getEventData(event);
  const detailChanges = describeChangedFields(oldData, newData);
  const snapshot = actionType === "DELETE" ? describeSnapshot(oldData) : describeSnapshot(newData);

  let target = entityType;
  if (entityType === "User") {
    target = `nhân viên ${formatValue(getValue(newData, "fullName", "FullName") ?? getValue(oldData, "fullName", "FullName"))}`;
  } else if (entityType === "Equipment") {
    target = `thiết bị ${formatValue(getValue(newData, "name", "Name") ?? getValue(oldData, "name", "Name"))}`;
  } else if (entityType === "RoomInventory") {
    target = "vật tư phòng";
  }

  const summary = `${toActionLabel(actionType)} ${target}.`;
  const detail = detailChanges || snapshot || getValue(event, "message", "Message") || summary;

  return {
    eventId: getValue(event, "eventId", "EventId") ?? fallbackEventId,
    timestamp: getValue(event, "timestamp", "Timestamp"),
    actionType,
    actionLabel: toActionLabel(actionType),
    objectName: entityType || "System",
    summary,
    detail: detail.startsWith(summary) ? detail : `${summary} ${detail}`.trim(),
  };
};

export const normalizeAuditLog = (log, lookups = { roomMap: new Map(), equipmentMap: new Map() }) => {
  const rawEvents = parseLogPayload(log.logData);
  const normalizedEvents = rawEvents.map((event, index) => {
    const entityType = getValue(event, "entityType", "EntityType");

    if (entityType === "LossAndDamage") {
      return buildLossAndDamageEvent(event, rawEvents, lookups, `${log.id}-${index}`);
    }

    return buildGenericEvent(event, `${log.id}-${index}`);
  }).filter((event) => event.objectName !== "Notification");

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

export const filterAuditLogs = (logs, filters) => {
  return logs.filter((log) => {
    const nameMatch = !filters.employeeName ||
      normalizeText(log.userName).includes(normalizeText(filters.employeeName));

    const roleMatch = !filters.roleName ||
      normalizeText(log.roleName) === normalizeText(filters.roleName);

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
    "<Cell><Data ss:Type=\"String\">Ngày lưu log</Data></Cell>",
    "<Cell><Data ss:Type=\"String\">Tên</Data></Cell>",
    "<Cell><Data ss:Type=\"String\">Vai trò</Data></Cell>",
    "<Cell><Data ss:Type=\"String\">Thời gian</Data></Cell>",
    "<Cell><Data ss:Type=\"String\">Hành động</Data></Cell>",
    "<Cell><Data ss:Type=\"String\">Đối tượng</Data></Cell>",
    "<Cell><Data ss:Type=\"String\">Nội dung chi tiết</Data></Cell>",
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

  const blob = new Blob([xml], {
    type: "application/octet-stream",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};
