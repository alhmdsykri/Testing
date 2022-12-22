namespace Sera.Application.Interface
{
    public interface ICosmosContext
    {
        Task CreateAsync(EventHistory entity);
        Task<EventHistory> GetAsync(string transactionId, string entity);
    }

    public interface IFirebaseContext
    {
        Task CreateAsync(Notification entity, int userId);
    }
}
