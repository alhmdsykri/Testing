namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateProductValidation : AbstractValidator<CreateProductRequest>
    {
        public CreateProductValidation()
        {
            List<int> productTypeId = new() {1, 2, 3};
            List<int> journeyTypeId = new() {1,2,3,4,5};
            List<int> DriverExpensePreTripIdypeId = new() {0, 1, 2 };
            List<int> DriverExpensePostTripId = new() {0,1, 2 };

            RuleFor(x => x.productName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.businessUnitId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.businessUnitCode).NotEmpty().MaximumLength(4);
            RuleFor(x => x.businessUnitName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.productTypeId).NotEmpty()
                              .Must(x => productTypeId.Contains(x))
                              .WithMessage("Please only use: " + String.Join(",", productTypeId));
            RuleFor(x => x.journeyTypeId).NotEmpty()
                              .Must(x => journeyTypeId.Contains(x))
                              .WithMessage("Please only use: " + String.Join(",", journeyTypeId));
            RuleFor(x => x.isExpedition).NotNull();
            When(x => x.isExpedition == true, () => { RuleFor(x => x.expeditionId).NotEmpty().MaximumLength(50); });
            RuleFor(x => (int)x.driverExpensePreTripId).GreaterThanOrEqualTo(0).LessThanOrEqualTo(2)
                         .WithMessage("Please only use: " + String.Join(",", DriverExpensePostTripId));
            RuleFor(x => (int)x.driverExpensePostTripId).GreaterThanOrEqualTo(0).LessThanOrEqualTo(2)
                         .WithMessage("Please only use: " + String.Join(",", DriverExpensePostTripId));
        }
    }

}
