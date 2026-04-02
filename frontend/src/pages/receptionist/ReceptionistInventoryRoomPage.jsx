import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Copy, Plus, Search } from "lucide-react";
import { inventoryApi } from "../../api/inventoryApi";
import { roomsApi } from "../../api/roomsApi";

export default function ReceptionistInventoryRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({
    itemName: "",
    quantity: 1,
    priceIfLost: 0,
  });
  const [saving, setSaving] = useState(false);

  const [showCopy, setShowCopy] = useState(false);
  const [sourceRoomId, setSourceRoomId] = useState("");
  const [sourceInventory, setSourceInventory] = useState([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [copying, setCopying] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsRes, invRes] = await Promise.all([
        roomsApi.getAll(),
        inventoryApi.getByRoom(roomId),
      ]);
      const list = roomsRes.data?.items ?? roomsRes.data ?? [];
      setRooms(list);
      setRoom(list.find((r) => String(r.id) === String(roomId)) || null);
      setInventory(invRes.data || []);
    } catch {
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter((x) => x.itemName?.toLowerCase().includes(q));
  }, [inventory, search]);

  const openCreate = () => {
    setCreateData({ itemName: "", quantity: 1, priceIfLost: 0 });
    setShowCreate(true);
  };

  const submitCreate = async () => {
    const itemName = createData.itemName.trim();
    if (!itemName) return;

    setSaving(true);
    try {
      await inventoryApi.create({
        roomId: Number(roomId),
        itemName,
        quantity: Number(createData.quantity || 0),
        priceIfLost: Number(createData.priceIfLost || 0),
      });
      setShowCreate(false);
      await refresh();
    } catch {
      setSaving(false);
      return;
    } finally {
      setSaving(false);
    }
  };

  const openCopy = () => {
    setSourceRoomId("");
    setSourceInventory([]);
    setSelectedIds(new Set());
    setShowCopy(true);
  };

  const loadSource = async (id) => {
    setSourceLoading(true);
    try {
      const res = await inventoryApi.getByRoom(id);
      setSourceInventory(res.data || []);
    } catch {
      setSourceInventory([]);
    } finally {
      setSourceLoading(false);
    }
  };

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyAll = async () => {
    if (!sourceRoomId) return;
    setCopying(true);
    try {
      await inventoryApi.clone({
        sourceRoomId: Number(sourceRoomId),
        targetRoomId: Number(roomId),
      });
      setShowCopy(false);
      await refresh();
    } catch {
      setCopying(false);
      return;
    } finally {
      setCopying(false);
    }
  };

  const copySelected = async () => {
    if (!sourceRoomId) return;
    const items = sourceInventory.filter((x) => selectedIds.has(x.id));
    if (items.length === 0) return;

    setCopying(true);
    try {
      await inventoryApi.bulkCreate(
        items.map((x) => ({
          roomId: Number(roomId),
          itemName: x.itemName,
          quantity: Number(x.quantity || 0),
          priceIfLost: Number(x.priceIfLost || 0),
        }))
      );
      setShowCopy(false);
      await refresh();
    } catch {
      setCopying(false);
      return;
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="page">
      <div className="checkHeader">
        <button type="button" className="iconBtn" onClick={() => navigate("/receptionist/inventory")}>
          <ChevronLeft size={18} />
        </button>
        <div className="checkTitleWrap">
          <div className="checkTitle">Quản lý vật tư phòng: {room?.roomNumber || "-"}</div>
          <div className="checkMeta">
            <span className="checkMetaLabel">Chức năng:</span>
            <span className="checkMetaValue">Thêm / Sao chép</span>
          </div>
        </div>
        <div className="checkHeaderRight">
          <div className="searchBox">
            <Search size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm nhanh vật tư..." />
          </div>
          <button type="button" className="btn btnGhost" onClick={openCopy}>
            <Copy size={16} /> Sao chép
          </button>
          <button type="button" className="btn btnPrimary" onClick={openCreate}>
            <Plus size={16} /> Thêm vật tư
          </button>
        </div>
      </div>

      <div className="card">
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Vật tư</th>
                <th className="colSmall">Số lượng</th>
                <th className="colSmall colRight">Giá đền bù</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="tdMuted">
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="tdMuted">
                    Không có vật tư.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="tdName">{item.itemName}</td>
                    <td className="tdQty">{item.quantity}</td>
                    <td className="tdMoney">{Number(item.priceIfLost || 0).toLocaleString()}đ</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate ? (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modalHead">
              <div className="modalTitle">Thêm vật tư</div>
              <button type="button" className="modalClose" onClick={() => setShowCreate(false)}>
                ✕
              </button>
            </div>
            <div className="modalBody">
              <div className="formField">
                <div className="label">Tên vật tư</div>
                <input
                  value={createData.itemName}
                  onChange={(e) => setCreateData((p) => ({ ...p, itemName: e.target.value }))}
                />
              </div>
              <div className="formRow">
                <div className="formField">
                  <div className="label">Số lượng</div>
                  <input
                    type="number"
                    min={0}
                    value={createData.quantity}
                    onChange={(e) => setCreateData((p) => ({ ...p, quantity: e.target.value }))}
                  />
                </div>
                <div className="formField">
                  <div className="label">Giá đền bù</div>
                  <input
                    type="number"
                    min={0}
                    value={createData.priceIfLost}
                    onChange={(e) => setCreateData((p) => ({ ...p, priceIfLost: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modalActions">
                <button type="button" className="btn btnGhost" onClick={() => setShowCreate(false)}>
                  Hủy
                </button>
                <button type="button" className="btn btnPrimary" onClick={submitCreate} disabled={saving}>
                  {saving ? "Đang lưu..." : "Thêm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showCopy ? (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modal modalWide">
            <div className="modalHead">
              <div className="modalTitle">Sao chép từ phòng khác</div>
              <button type="button" className="modalClose" onClick={() => setShowCopy(false)}>
                ✕
              </button>
            </div>
            <div className="modalBody">
              <div className="copyTop">
                <select
                  className="select"
                  value={sourceRoomId}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSourceRoomId(next);
                    setSelectedIds(new Set());
                    if (next) loadSource(next);
                  }}
                >
                  <option value="">Chọn phòng nguồn...</option>
                  {rooms
                    .filter((r) => String(r.id) !== String(roomId))
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} ({r.roomTypeName})
                      </option>
                    ))}
                </select>

                <button type="button" className="btn btnGhost" onClick={copyAll} disabled={!sourceRoomId || copying}>
                  Sao chép tất cả
                </button>
                <button type="button" className="btn btnPrimary" onClick={copySelected} disabled={!sourceRoomId || copying}>
                  Sao chép đã chọn
                </button>
              </div>

              <div className="tableWrap tableWrapMax">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="colTiny">Chọn</th>
                      <th>Vật tư</th>
                      <th className="colSmall">SL</th>
                      <th className="colSmall colRight">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourceLoading ? (
                      <tr>
                        <td colSpan={4} className="tdMuted">
                          Đang tải...
                        </td>
                      </tr>
                    ) : !sourceRoomId ? (
                      <tr>
                        <td colSpan={4} className="tdMuted">
                          Chọn phòng nguồn để xem danh sách vật tư.
                        </td>
                      </tr>
                    ) : sourceInventory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="tdMuted">
                          Phòng nguồn không có vật tư.
                        </td>
                      </tr>
                    ) : (
                      sourceInventory.map((item) => (
                        <tr key={item.id}>
                          <td className="tdCheck">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => toggle(item.id)}
                            />
                          </td>
                          <td className="tdName">{item.itemName}</td>
                          <td className="tdQty">{item.quantity}</td>
                          <td className="tdMoney">{Number(item.priceIfLost || 0).toLocaleString()}đ</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
