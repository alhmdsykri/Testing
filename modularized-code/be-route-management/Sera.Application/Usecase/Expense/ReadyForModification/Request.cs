namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class TripExpenseReadyForModificationRequest : IRequest<Response<TripExpenseReadyForModificationResponse>>
    {
        public int tripExpenseId { get; set; }
    }
}