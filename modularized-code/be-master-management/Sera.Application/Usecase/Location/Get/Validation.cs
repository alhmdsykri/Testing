namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetBranchValidation : AbstractValidator<GetLocationRequest>
    {
        public GetBranchValidation()
        {
            RuleFor(x => x.locationId).NotEmpty();
        }
    }
}