namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateVehicleValidation : AbstractValidator<UpdateVehicleRequest>
    {
        public UpdateVehicleValidation()
        {
            RuleFor(x => x.vehicleId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.licensePlate).NotEmpty()
                                        .MaximumLength(10)
                                        .When(x => !string.IsNullOrEmpty(x.licensePlate))
                                        .Matches(CommonConst.REGEX_CODE)
                                        .WithMessage(Message.InvalidRegexCode());
            RuleFor(x => x.vin).NotEmpty()
                               .MaximumLength(17)
                               .When(x => !string.IsNullOrEmpty(x.vin))
                               .Matches(CommonConst.REGEX_CODE)
                               .WithMessage(Message.InvalidRegexCode());
            RuleFor(x => x.vehicleCategoryId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.vehicleBrandId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.vehicleColorId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.vehicleModelId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.vehicleYear).NotEmpty().GreaterThan(999).LessThan(9999);
            RuleFor(x => x.validFrom).NotEmpty();
            RuleFor(x => x.validTo).NotEmpty().GreaterThan(x => x.validFrom);
            RuleFor(x => x.fueltypeId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.transmission).NotNull().GreaterThanOrEqualTo(0).LessThanOrEqualTo(1);
            RuleFor(x => x.hasOBD).NotNull();
            RuleFor(x => x.businessUnitId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.businessUnitCode).NotEmpty()
                                            .MaximumLength(4)
                                            .When(x => !string.IsNullOrEmpty(x.businessUnitCode))
                                            .Matches(CommonConst.REGEX_CODE)
                                            .WithMessage(Message.InvalidRegexCode());
            RuleFor(x => x.businessUnitName).NotEmpty()
                                            .MaximumLength(100)
                                            .Matches(CommonConst.REGEX_NAME)
                                            .WithMessage(Message.InvalidRegexName());
            RuleFor(x => x.branchId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.branchCode).NotEmpty()
                                      .MaximumLength(4)
                                      .When(x => !string.IsNullOrEmpty(x.branchCode))
                                      .Matches(CommonConst.REGEX_CODE)
                                      .WithMessage(Message.InvalidRegexCode());
            RuleFor(x => x.branchName).NotEmpty()
                                      .MaximumLength(100)
                                      .Matches(CommonConst.REGEX_NAME)
                                      .WithMessage(Message.InvalidRegexName());
            RuleFor(x => x.locationId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.locationCode).NotEmpty()
                                        .When(x => !string.IsNullOrEmpty(x.locationCode))
                                        .Matches(CommonConst.REGEX_CODE)
                                        .WithMessage(Message.InvalidRegexCode());
            RuleFor(x => x.locationName).NotEmpty()
                                        .MaximumLength(100)
                                        .Matches(CommonConst.REGEX_NAME)
                                        .WithMessage(Message.InvalidRegexName());
        }
    }
}
