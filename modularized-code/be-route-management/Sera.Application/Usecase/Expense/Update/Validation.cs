namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateExpenseValidation : AbstractValidator<UpdateExpenseRequest>
    {
        public UpdateExpenseValidation()
        {
            RuleFor(x => x.routeId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.tripExpenseId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.totalExpense).NotEmpty().GreaterThan(0);
            RuleFor(x => x.revenue).NotEmpty().GreaterThan(0);
            RuleFor(x => x.uomCode).NotEmpty();
            RuleFor(x => x.COGS).NotEmpty().GreaterThan(0);
        }
    }
}
