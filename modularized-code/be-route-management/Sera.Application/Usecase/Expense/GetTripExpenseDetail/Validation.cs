namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetTripExpenseDetailValidation : AbstractValidator<GetTripExpenseDetailRequest>
    {
        public GetTripExpenseDetailValidation()
        {
            RuleFor(x => x.tripExpenseId).NotEmpty();
        }
    }
}