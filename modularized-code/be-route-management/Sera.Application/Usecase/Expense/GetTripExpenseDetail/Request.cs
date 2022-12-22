namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetTripExpenseDetailRequest : IRequest<Response<GetTripExpenseDetailResponse>>
    {
        public int tripExpenseId { get; set; }
    }
}