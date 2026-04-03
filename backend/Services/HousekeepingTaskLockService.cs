using System.Collections.Concurrent;

namespace backend.Services
{
    public class HousekeepingTaskLockService
    {
        private readonly ConcurrentDictionary<int, int> _locks = new();

        public int? GetAssignedUserId(int roomId)
        {
            return _locks.TryGetValue(roomId, out var userId) ? userId : null;
        }

        public bool TryAssign(int roomId, int userId)
        {
            return _locks.TryAdd(roomId, userId);
        }

        public bool IsAssignedTo(int roomId, int userId)
        {
            return _locks.TryGetValue(roomId, out var assignedUserId) && assignedUserId == userId;
        }

        public void ForceAssign(int roomId, int userId)
        {
            _locks[roomId] = userId;
        }

        public void Release(int roomId)
        {
            _locks.TryRemove(roomId, out _);
        }
    }
}
