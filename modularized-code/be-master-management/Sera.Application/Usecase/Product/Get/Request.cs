namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetProductRequest : IRequest<Response<GetProductResponse>>
    {
        public int productId { get; set; }
    }
}