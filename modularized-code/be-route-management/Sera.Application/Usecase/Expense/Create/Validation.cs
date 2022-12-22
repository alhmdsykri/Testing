namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class TripExpenseValidation : AbstractValidator<tripExpenseModel>
    {
        public TripExpenseValidation()
        {
            RuleFor(x => x.routeId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.productId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.vehicleTypeId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.vehicleTypeCode).NotEmpty();
            RuleFor(x => x.vehicleTypeName).NotEmpty();
            RuleFor(x => x.totalExpense).NotEmpty().GreaterThan(0);
            RuleFor(x => x.revenue).NotEmpty().GreaterThan(0);
            RuleFor(x => x.uomCode).NotEmpty();
            RuleFor(x => x.COGS).NotEmpty().GreaterThan(0);
        }
    }
}