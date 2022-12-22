namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateProductValidation : AbstractValidator<UpdateProductRequest>
    {
        public UpdateProductValidation()
        {
            List<int> productType = new() { 1, 2, 3 };
            List<int> journeyType = new() { 1, 2, 3, 4, 5 };
            List<int> driverExpenseTrip = new() { 0, 1, 2 };
            List<int> productStatus = new() { 0, 1 };

            RuleFor(x => x.productId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.productName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.productStatus).NotNull().Must(x => productStatus.Contains(x))
                                         .WithMessage("Please only use: " + String.Join(",", productStatus));
            RuleFor(x => x.productTypeId).NotNull()
                                         .Must(x => productType.Contains(x))
                                         .WithMessage("Please only use: " + String.Join(",", productType));
            RuleFor(x => x.journeyTypeId).NotNull()
                                         .Must(x => journeyType.Contains(x))
                                         .WithMessage("Please only use: " + String.Join(",", journeyType));
            RuleFor(x => x.isExpedition).NotNull();
            When(x => x.isExpedition == true, () => { RuleFor(x => x.expeditionId).NotEmpty().MaximumLength(50); });
            RuleFor(x => x.isAssignedToVehicle).NotNull();
            RuleFor(x => x.isAssignedToDriver).NotNull();
            RuleFor(x => x.driverExpensePreTripId).NotNull().Must(x => driverExpenseTrip.Contains(x))
                                                  .WithMessage("Please only use: " + String.Join(",", driverExpenseTrip));
            RuleFor(x => x.driverExpensePostTripId).NotNull().Must(x => driverExpenseTrip.Contains(x))
                                                   .WithMessage("Please only use: " + String.Join(",", driverExpenseTrip));
            RuleFor(x => x.isReconcilation).NotNull();
            RuleFor(x => x.hasProofOfDelivery).NotNull();
        }
    }
}