namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetTripExpenseCategoryRequest : IRequest<Response<IEnumerable<GetTripExpenseCategoryResponse>>>
    {
        public int productId { get; set; }
    }
}