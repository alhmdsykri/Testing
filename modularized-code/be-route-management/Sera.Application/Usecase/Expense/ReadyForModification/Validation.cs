namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class ReadyForModificationValidation : AbstractValidator<TripExpenseReadyForModificationRequest>
    {
        public ReadyForModificationValidation()
        {
            RuleFor(x => x.tripExpenseId).NotEmpty();
        }
    }
}