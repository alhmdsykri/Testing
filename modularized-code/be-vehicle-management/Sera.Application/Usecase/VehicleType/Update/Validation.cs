namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateVehicleTypeValidation : AbstractValidator<UpdateVehicleTypeRequest>
    {
        public UpdateVehicleTypeValidation()
        {
            RuleFor(x => x.vehicleTypeId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.driverLicenseTypeId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.driverLicenseTypeCode).NotEmpty().MaximumLength(4)
                                                 .When(x => !string.IsNullOrEmpty(x.driverLicenseTypeCode))
                                                 .Matches(CommonConst.REGEX_CODE)
                                                 .WithMessage(Message.InvalidRegexCode()); ;
            RuleFor(x => x.driverLicenseTypeName).NotEmpty().MaximumLength(50)
                                                 .Matches(CommonConst.REGEX_NAME)
                                                 .WithMessage(Message.InvalidRegexName());
            RuleFor(x => x.description).MaximumLength(600);
        }
    }
}
