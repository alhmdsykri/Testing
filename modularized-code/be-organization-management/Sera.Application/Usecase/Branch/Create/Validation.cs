namespace Sera.Application.Usecase
{
    public class CreateBranchValidation : AbstractValidator<CreateBranchRequest>
    {
        [ExcludeFromCodeCoverage]
        public CreateBranchValidation()
        {
            RuleFor(x => x.branchCode).NotEmpty()
                                      .MaximumLength(4)
                                      .When(x => !string.IsNullOrEmpty(x.branchCode))
                                      .Matches(CommonConst.REGEX_CODE)
                                      .WithMessage("Numbers and letters only please.");
            RuleFor(x => x.branchName).NotEmpty()
                                      .MaximumLength(100)
                                      .Matches(CommonConst.REGEX_NAME)
                                      .WithMessage("Numbers, letters, space, point and comma only please.");
            RuleFor(x => x.businessUnitId).NotEmpty();
            RuleFor(x => x.regionId).NotEmpty();
            RuleFor(x => x.sapIntegrated).NotNull();
        }
    }
}
