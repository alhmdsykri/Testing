namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class DeleteLocationRequest :
        ServiceBusRequest<DeleteLocationModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class DeleteLocationModel
    {
        public int locationId { get; set; }
    }
}
