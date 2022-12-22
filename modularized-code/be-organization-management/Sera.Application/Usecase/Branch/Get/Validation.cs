namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetBranchValidation : AbstractValidator<GetBranchRequest>
    {
        public GetBranchValidation()
        {
            RuleFor(x => x.branchId).NotEmpty();
        }
    }
}
