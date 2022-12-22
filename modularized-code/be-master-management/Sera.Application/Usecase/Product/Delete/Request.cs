namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class DeleteProductRequest : IRequest<Response>
    {
        public int productId { get; set; }
    }
}
