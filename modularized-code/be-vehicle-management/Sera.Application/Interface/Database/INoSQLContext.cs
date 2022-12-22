namespace Sera.Application.Interface
{
    public interface ICosmosContext
    {
        Task CreateAsync(EventHistory entity);
    }

    public interface IFirebaseContext
    {
        Task CreateAsync(Notification entity, int userId);
    }
}
