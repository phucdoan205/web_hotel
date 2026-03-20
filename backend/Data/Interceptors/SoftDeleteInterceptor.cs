using backend.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace backend.Data.Interceptors
{
    public class SoftDeleteInterceptor : SaveChangesInterceptor
    {
        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            if (eventData.Context == null) return base.SavingChangesAsync(eventData, result, cancellationToken);

            foreach (var entry in eventData.Context.ChangeTracker.Entries<ISoftDelete>()
                .Where(e => e.State == EntityState.Deleted))
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedAt = DateTime.UtcNow;
            }

            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }
    }
}
