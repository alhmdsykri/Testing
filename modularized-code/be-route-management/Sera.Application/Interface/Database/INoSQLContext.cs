namespace Sera.Application.Interface
{
    public interface ICosmosContext
    {
        DbSet<cosmos.EventHistory> EventHistory { get; set; }
        Task<EventHistory> GetAsync(string transactionId, string entity);
        Task CreateAsync(EventHistory entity);
    }
    public interface IFirebaseContext
    {
        Task CreateAsync(Notification entity, int userId);
    }
}
