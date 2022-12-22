namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateVehicleValidation : AbstractValidator<CreateVehicleRequest>
    {
        public CreateVehicleValidation()
        {
            RuleFor(x => x.vehicleTypeCode).MaximumLength(4)
                          .When(x => !string.IsNullOrEmpty(x.vehicleTypeCode))
                          .Matches(CommonConst.REGEX_CODE)
                          .WithMessage("Numbers and letters only please.");
            RuleFor(x => x.licensePlate).MaximumLength(10)
                          .When(x => !string.IsNullOrEmpty(x.licensePlate))
                          .Matches(CommonConst.REGEX_CODE)
                          .WithMessage("Numbers and letters only please.");
            RuleFor(x => x.vin).MaximumLength(17)
                          .When(x => !string.IsNullOrEmpty(x.vin))
                          .Matches(CommonConst.REGEX_CODE)
                          .WithMessage("Numbers and letters only please.");
            RuleFor(x => x.vehicleCategoryId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.vehicleBrandId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.vehicleModelId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.vehicleColorId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.vehicleYear).NotEmpty().GreaterThan(999);
            RuleFor(x => x.validFrom).NotEmpty();
            RuleFor(x => x.validTo).NotEmpty().GreaterThan(x => x.validFrom);
            RuleFor(x => x.ownership).NotEmpty().MaximumLength(10);
            RuleFor(x => x.transmission).GreaterThanOrEqualTo(0).LessThanOrEqualTo(1);
            RuleFor(x => x.fuelTypeId).NotEmpty();
            RuleFor(x => x.businessUnitId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.businessUnitCode).MaximumLength(4)
                          .When(x => !string.IsNullOrEmpty(x.businessUnitCode))
                          .Matches(CommonConst.REGEX_CODE)
                          .WithMessage("Numbers and letters only please.");
            RuleFor(x => x.businessUnitName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.branchId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.branchCode).MaximumLength(4)
                          .When(x => !string.IsNullOrEmpty(x.businessUnitCode))
                          .Matches(CommonConst.REGEX_CODE)
                          .WithMessage("Numbers and letters only please.");
            RuleFor(x => x.branchName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.locationId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.locationCode).NotEmpty()
                          .When(x => !string.IsNullOrEmpty(x.locationCode))
                          .Matches(CommonConst.REGEX_CODE)
                          .WithMessage("Numbers and letters only please.");
            RuleFor(x => x.locationName).NotEmpty().MaximumLength(100);
        }
    }
}
