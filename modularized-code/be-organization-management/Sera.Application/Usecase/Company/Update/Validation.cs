namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateCompanyValidation : AbstractValidator<UpdateCompanyRequest>
    {
        public UpdateCompanyValidation()
        {
            RuleFor(x => x.companyId).NotEmpty();
            RuleFor(x => x.companyName).NotEmpty()
                                       .MaximumLength(100)
                                       .Matches(CommonConst.REGEX_NAME)
                                       .WithMessage("Numbers, letters, space, point and comma only please.");
            RuleFor(x => x.companyCode).MaximumLength(4)
                                       .When(x => !string.IsNullOrEmpty(x.companyCode))
                                       .Matches(CommonConst.REGEX_CODE)
                                       .WithMessage("Numbers and letters only please.");
            RuleFor(x => x.parentCompanyId).GreaterThan((short)0).When(x => x.parentCompanyId != null);
            RuleFor(x => x.structureLevel).NotEmpty().InclusiveBetween((byte)1, (byte)255);
            RuleFor(x => x.suspendFlag).NotNull();
            RuleFor(x => x.sapIntegrated).NotNull();
            RuleFor(x => x.isNameUpdated).NotNull();
        }
    }
}
