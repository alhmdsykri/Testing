namespace Sera.Application.Usecase
{
    public class CreateContractValidation : AbstractValidator<CreateContractRequest>
    {
        public CreateContractValidation()
        {
            RuleFor(x => x.customerId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.businessUnitId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.businessUnitCode).MaximumLength(4)
                          .When(x => !string.IsNullOrEmpty(x.businessUnitCode))
                          .Matches(CommonConst.REGEX_CODE)
                          .WithMessage("Numbers and letters only please.");
            RuleFor(x => x.businessUnitName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.startDate).NotEmpty().GreaterThanOrEqualTo(DateTime.Now.Date);
            RuleFor(x => x.endDate).NotEmpty().GreaterThan(x => x.startDate);
        }
    }
}
