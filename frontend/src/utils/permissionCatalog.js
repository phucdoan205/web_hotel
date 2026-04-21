const PERMISSION_LABELS = {
  VIEW_DASHBOARD: "Xem dashboard",
  VIEW_USERS: "Xem nhân viên",
  CREATE_USERS: "Tạo nhân viên",
  EDIT_USERS: "Sửa nhân viên",
  DELETE_USERS: "Xóa nhân viên",
  VIEW_ROLES: "Xem vai trò",
  CREATE_ROLES: "Tạo vai trò",
  EDIT_ROLES: "Sửa vai trò",
  DELETE_ROLES: "Xóa vai trò",
  VIEW_ROOMS: "Xem phòng",
  CREATE_ROOMS: "Tạo phòng",
  EDIT_ROOMS: "Sửa phòng",
  DELETE_ROOMS: "Xóa phòng",
  INVENTORY_ROOMS: "Vật tư phòng",
  VIEW_ROOM_TRACKING: "Xem theo dõi phòng",
  UPDATE_ROOM_STATUS: "Cập nhật trạng thái phòng",
  VIEW_BOOKINGS: "Xem booking",
  CREATE_BOOKINGS: "Tạo booking",
  EDIT_BOOKINGS: "Sửa booking",
  DELETE_BOOKINGS: "Xóa booking",
  CHECKIN_BOOKING: "Check-in booking",
  CHECKOUT_BOOKING: "Check-out booking",
  VIEW_INVOICES: "Xem hóa đơn",
  CREATE_INVOICES: "Tạo hóa đơn",
  EDIT_INVOICES: "Sửa hóa đơn",
  DELETE_INVOICES: "Xóa hóa đơn",
  PAY_INVOICE: "Thanh toán hóa đơn",
  VIEW_ATTRACTIONS: "Xem địa điểm",
  CREATE_ATTRACTIONS: "Tạo địa điểm",
  EDIT_ATTRACTIONS: "Sửa địa điểm",
  DELETE_ATTRACTIONS: "Xóa địa điểm",
  VIEW_VOUCHERS: "Xem voucher",
  CREATE_VOUCHERS: "Tạo voucher",
  EDIT_VOUCHERS: "Sửa voucher",
  DELETE_VOUCHERS: "Xóa voucher",
  ENABLE_VOUCHER: "Bật voucher",
  DISABLE_VOUCHER: "Tắt voucher",
  SEND_VOUCHER: "Gửi voucher",
  VIEW_SERVICES: "Xem dịch vụ",
  CREATE_SERVICES: "Tạo dịch vụ",
  EDIT_SERVICES: "Sửa dịch vụ",
  DELETE_SERVICES: "Xóa dịch vụ",
  VIEW_CONTENT: "Xem nội dung",
  CREATE_CONTENT: "Tạo nội dung",
  EDIT_CONTENT: "Sửa nội dung",
  DELETE_CONTENT: "Xóa nội dung",
  PUBLISH_CONTENT: "Xuất bản nội dung",
  VIEW_INVENTORY: "Xem vật tư",
  CREATE_INVENTORY: "Tạo vật tư",
  EDIT_INVENTORY: "Sửa vật tư",
  DELETE_INVENTORY: "Xóa vật tư",
  VIEW_HOUSEKEEPING: "Xem nhiệm vụ dọn phòng",
  CREATE_HOUSEKEEPING: "Tạo nhiệm vụ dọn phòng",
  ASSIGN_HOUSEKEEPING: "Phân công dọn phòng",
  VIEW_COMPENSATION: "Xem thất thoát đền bù",
  CREATE_COMPENSATION: "Tạo thất thoát đền bù",
  EDIT_COMPENSATION: "Sửa thất thoát đền bù",
  PROCESS_COMPENSATION: "Xử lý thất thoát đền bù",
  VIEW_LOG: "Xem audit log",
};

const PERMISSION_DESCRIPTIONS = {
  VIEW_DASHBOARD: "Cho phép truy cập trang dashboard tổng quan.",
  VIEW_USERS: "Cho phép xem danh sách và thông tin nhân viên.",
  CREATE_USERS: "Cho phép tạo tài khoản nhân viên mới.",
  EDIT_USERS: "Cho phép chỉnh sửa hồ sơ, vai trò và thông tin nhân viên.",
  DELETE_USERS: "Cho phép khóa hoặc xóa nhân viên khỏi hệ thống.",
  VIEW_ROLES: "Cho phép xem danh sách vai trò và quyền hiện có.",
  CREATE_ROLES: "Cho phép tạo vai trò mới.",
  EDIT_ROLES: "Cho phép chỉnh sửa tên, mô tả và quyền của vai trò.",
  DELETE_ROLES: "Cho phép xóa vai trò chưa được sử dụng.",
  VIEW_ROOMS: "Cho phép xem danh sách phòng và chi tiết phòng.",
  CREATE_ROOMS: "Cho phép thêm phòng mới.",
  EDIT_ROOMS: "Cho phép cập nhật thông tin phòng.",
  DELETE_ROOMS: "Cho phép xóa hoặc ẩn phòng khỏi hệ thống.",
  INVENTORY_ROOMS: "Cho phép xem và quản lý vật tư theo từng phòng.",
  VIEW_ROOM_TRACKING: "Cho phép xem trạng thái vận hành của phòng.",
  UPDATE_ROOM_STATUS: "Cho phép cập nhật trạng thái phòng theo thời gian thực.",
  VIEW_BOOKINGS: "Cho phép xem danh sách booking.",
  CREATE_BOOKINGS: "Cho phép tạo booking mới.",
  EDIT_BOOKINGS: "Cho phép chỉnh sửa booking hiện có.",
  DELETE_BOOKINGS: "Cho phép hủy hoặc xóa booking.",
  CHECKIN_BOOKING: "Cho phép thao tác nhận phòng cho booking.",
  CHECKOUT_BOOKING: "Cho phép thao tác trả phòng cho booking.",
  VIEW_INVOICES: "Cho phép xem hóa đơn và chi tiết thanh toán.",
  CREATE_INVOICES: "Cho phép tạo hóa đơn mới.",
  EDIT_INVOICES: "Cho phép cập nhật thông tin hóa đơn.",
  DELETE_INVOICES: "Cho phép xóa hóa đơn không hợp lệ.",
  PAY_INVOICE: "Cho phép ghi nhận và xử lý thanh toán hóa đơn.",
  VIEW_ATTRACTIONS: "Cho phép xem danh sách địa điểm và site map quản trị.",
  CREATE_ATTRACTIONS: "Cho phép tạo địa điểm mới.",
  EDIT_ATTRACTIONS: "Cho phép chỉnh sửa thông tin và trạng thái hiển thị địa điểm.",
  DELETE_ATTRACTIONS: "Cho phép xóa địa điểm khỏi hệ thống.",
  VIEW_VOUCHERS: "Cho phép xem danh sách voucher và thông tin voucher.",
  CREATE_VOUCHERS: "Cho phép tạo voucher mới.",
  EDIT_VOUCHERS: "Cho phép chỉnh sửa thông tin voucher.",
  DELETE_VOUCHERS: "Cho phép xóa voucher khỏi hệ thống.",
  ENABLE_VOUCHER: "Cho phép bật trạng thái hoạt động cho voucher.",
  DISABLE_VOUCHER: "Cho phép tắt trạng thái hoạt động của voucher.",
  SEND_VOUCHER: "Cho phép gửi voucher cho khách hàng.",
  VIEW_SERVICES: "Cho phép xem danh mục dịch vụ.",
  CREATE_SERVICES: "Cho phép thêm dịch vụ mới.",
  EDIT_SERVICES: "Cho phép cập nhật thông tin dịch vụ.",
  DELETE_SERVICES: "Cho phép xóa dịch vụ.",
  VIEW_CONTENT: "Cho phép xem bài viết và nội dung đã tạo.",
  CREATE_CONTENT: "Cho phép tạo nội dung mới.",
  EDIT_CONTENT: "Cho phép chỉnh sửa nội dung hiện có.",
  DELETE_CONTENT: "Cho phép xóa, chuyển thùng rác hoặc khôi phục bài viết.",
  PUBLISH_CONTENT: "Cho phép duyệt và xuất bản nội dung.",
  VIEW_INVENTORY: "Cho phép xem tồn kho và vật tư.",
  CREATE_INVENTORY: "Cho phép thêm vật tư mới.",
  EDIT_INVENTORY: "Cho phép cập nhật số lượng hoặc thông tin vật tư.",
  DELETE_INVENTORY: "Cho phép xóa vật tư.",
  VIEW_HOUSEKEEPING: "Cho phép xem danh sách nhiệm vụ dọn phòng.",
  CREATE_HOUSEKEEPING: "Cho phép tạo nhiệm vụ dọn phòng mới.",
  ASSIGN_HOUSEKEEPING: "Cho phép phân công nhân viên buồng phòng.",
  VIEW_COMPENSATION: "Cho phép xem các phiếu thất thoát đền bù.",
  CREATE_COMPENSATION: "Cho phép tạo phiếu thất thoát đền bù.",
  EDIT_COMPENSATION: "Cho phép chỉnh sửa phiếu thất thoát đền bù.",
  PROCESS_COMPENSATION: "Cho phép xử lý và hoàn tất phiếu thất thoát đền bù.",
  VIEW_LOG: "Cho phép xem lịch sử thao tác hệ thống.",
};

const SIDEBAR_PERMISSION_GROUPS = [
  {
    id: "dashboard",
    label: "Dashboard",
    sections: [
      {
        id: "dashboard-overview",
        title: "Dashboard",
        permissionNames: ["VIEW_DASHBOARD"],
      },
    ],
  },
  {
    id: "staff",
    label: "Nhân viên",
    sections: [
      {
        id: "staff-users",
        title: "Nhân viên",
        permissionNames: ["VIEW_USERS", "CREATE_USERS", "EDIT_USERS", "DELETE_USERS"],
      },
      {
        id: "staff-roles",
        title: "Vai trò",
        permissionNames: ["VIEW_ROLES", "CREATE_ROLES", "EDIT_ROLES", "DELETE_ROLES"],
      },
    ],
  },
  {
    id: "room-status",
    label: "Theo dõi phòng",
    sections: [
      {
        id: "room-status-tracking",
        title: "Theo dõi phòng",
        permissionNames: ["VIEW_ROOM_TRACKING", "UPDATE_ROOM_STATUS"],
      },
    ],
  },
  {
    id: "rooms",
    label: "Quản lý phòng",
    sections: [
      {
        id: "rooms-management",
        title: "Phòng",
        permissionNames: ["VIEW_ROOMS", "CREATE_ROOMS", "EDIT_ROOMS", "DELETE_ROOMS", "INVENTORY_ROOMS"],
      },
    ],
  },
  {
    id: "housekeeping",
    label: "Nhiệm vụ dọn phòng",
    sections: [
      {
        id: "housekeeping-management",
        title: "Dọn phòng",
        permissionNames: ["VIEW_HOUSEKEEPING", "CREATE_HOUSEKEEPING", "ASSIGN_HOUSEKEEPING"],
      },
    ],
  },
  {
    id: "inventory",
    label: "Vật tư",
    sections: [
      {
        id: "inventory-management",
        title: "Vật tư",
        permissionNames: ["VIEW_INVENTORY", "CREATE_INVENTORY", "EDIT_INVENTORY", "DELETE_INVENTORY"],
      },
    ],
  },
  {
    id: "compensation",
    label: "Thất thoát đền bù",
    sections: [
      {
        id: "compensation-management",
        title: "Thất thoát đền bù",
        permissionNames: [
          "VIEW_COMPENSATION",
          "CREATE_COMPENSATION",
          "EDIT_COMPENSATION",
          "PROCESS_COMPENSATION",
        ],
      },
    ],
  },
  {
    id: "booking",
    label: "Booking",
    sections: [
      {
        id: "booking-management",
        title: "Booking",
        permissionNames: [
          "VIEW_BOOKINGS",
          "CREATE_BOOKINGS",
          "EDIT_BOOKINGS",
          "DELETE_BOOKINGS",
          "CHECKIN_BOOKING",
          "CHECKOUT_BOOKING",
        ],
      },
    ],
  },
  {
    id: "invoice",
    label: "Hóa đơn",
    sections: [
      {
        id: "invoice-management",
        title: "Hóa đơn",
        permissionNames: [
          "VIEW_INVOICES",
          "CREATE_INVOICES",
          "EDIT_INVOICES",
          "DELETE_INVOICES",
          "PAY_INVOICE",
        ],
      },
    ],
  },
  {
    id: "service",
    label: "Dịch vụ",
    sections: [
      {
        id: "service-management",
        title: "Dịch vụ",
        permissionNames: ["VIEW_SERVICES", "CREATE_SERVICES", "EDIT_SERVICES", "DELETE_SERVICES"],
      },
    ],
  },
  {
    id: "attractions",
    label: "Địa điểm",
    sections: [
      {
        id: "attractions-management",
        title: "Địa điểm",
        permissionNames: ["VIEW_ATTRACTIONS", "CREATE_ATTRACTIONS", "EDIT_ATTRACTIONS", "DELETE_ATTRACTIONS"],
      },
    ],
  },
  {
    id: "vouchers",
    label: "Voucher",
    sections: [
      {
        id: "vouchers-management",
        title: "Voucher",
        permissionNames: [
          "VIEW_VOUCHERS",
          "CREATE_VOUCHERS",
          "EDIT_VOUCHERS",
          "DELETE_VOUCHERS",
          "ENABLE_VOUCHER",
          "DISABLE_VOUCHER",
          "SEND_VOUCHER",
        ],
      },
    ],
  },
  {
    id: "content",
    label: "Bài viết",
    sections: [
      {
        id: "content-management",
        title: "Nội dung",
        permissionNames: ["VIEW_CONTENT", "CREATE_CONTENT", "EDIT_CONTENT", "DELETE_CONTENT", "PUBLISH_CONTENT"],
      },
    ],
  },
  {
    id: "audit-log",
    label: "Audit log",
    sections: [
      {
        id: "audit-log-management",
        title: "Audit log",
        permissionNames: ["VIEW_LOG"],
      },
    ],
  },
];

const HIDDEN_PERMISSION_NAMES = new Set();

const humanizePermissionName = (permissionName) =>
  permissionName
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildPermissionMeta = (permission) => ({
  ...permission,
  displayName: PERMISSION_LABELS[permission.name] ?? humanizePermissionName(permission.name),
  description:
    PERMISSION_DESCRIPTIONS[permission.name] ?? "Cho phép thao tác chức năng này trong hệ thống.",
});

export const buildPermissionSidebar = (permissions) => {
  const visiblePermissions = permissions.filter(
    (permission) => !HIDDEN_PERMISSION_NAMES.has(permission.name),
  );

  const permissionMap = new Map(
    visiblePermissions.map((permission) => [permission.name, buildPermissionMeta(permission)]),
  );

  const sidebar = SIDEBAR_PERMISSION_GROUPS.map((group) => ({
    ...group,
    sections: group.sections
      .map((section) => {
        const sectionPermissions = section.permissionNames
          .map((permissionName) => permissionMap.get(permissionName))
          .filter(Boolean);

        if (sectionPermissions.length === 0) {
          return null;
        }

        const orderedPermissions = [...sectionPermissions].sort((left, right) => {
          const leftIsView = left.name.startsWith("VIEW_");
          const rightIsView = right.name.startsWith("VIEW_");

          if (leftIsView && !rightIsView) {
            return -1;
          }

          if (!leftIsView && rightIsView) {
            return 1;
          }

          return left.displayName.localeCompare(right.displayName);
        });

        return {
          ...section,
          permissions: orderedPermissions,
          viewPermissionName:
            orderedPermissions.find((permission) => permission.name.startsWith("VIEW_"))?.name ?? null,
        };
      })
      .filter(Boolean),
  })).filter((group) => group.sections.length > 0);

  const groupedPermissionNames = new Set(
    sidebar.flatMap((group) =>
      group.sections.flatMap((section) => section.permissions.map((permission) => permission.name)),
    ),
  );

  const uncategorizedPermissions = visiblePermissions
    .filter((permission) => !groupedPermissionNames.has(permission.name))
    .map(buildPermissionMeta)
    .sort((left, right) => left.displayName.localeCompare(right.displayName));

  if (uncategorizedPermissions.length > 0) {
    sidebar.push({
      id: "other",
      label: "Khác",
      sections: [
        {
          id: "other-permissions",
          title: "Quyền khác",
          permissions: uncategorizedPermissions,
          viewPermissionName:
            uncategorizedPermissions.find((permission) => permission.name.startsWith("VIEW_"))?.name ?? null,
        },
      ],
    });
  }

  return sidebar;
};
