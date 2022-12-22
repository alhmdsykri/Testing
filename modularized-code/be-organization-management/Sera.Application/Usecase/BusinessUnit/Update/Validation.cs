namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateBusinessUnitValidation : AbstractValidator<UpdateBusinessUnitRequest>
    {
        public UpdateBusinessUnitValidation()
        {
            RuleFor(x => x.businessUnitId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.businessUnitCode).MaximumLength(4)
                                       .When(x => !string.IsNullOrEmpty(x.businessUnitCode))
                                       .Matches(CommonConst.REGEX_CODE)
                                       .WithMessage("Numbers and letters only please.");
            RuleFor(x => x.businessUnitName).NotEmpty()
                                       .MaximumLength(100)
                                       .Matches(CommonConst.REGEX_NAME)
                                       .WithMessage("Numbers, letters, space, point and comma only please.");
            RuleFor(x => x.companyId).GreaterThan((short)0);
            RuleFor(x => x.sapIntegrated).NotNull();
            RuleFor(x => x.isNameUpdated).NotNull();
        }
    }
}
