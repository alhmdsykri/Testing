namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class DeleteProductRequest :
        ServiceBusRequest<DeleteProductModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class DeleteProductModel
    {
        public int productId { get; set; }
    }
}
