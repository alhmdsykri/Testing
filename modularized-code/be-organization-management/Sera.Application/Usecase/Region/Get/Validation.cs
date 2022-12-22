namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRegionValidation : AbstractValidator<GetRegionRequest>
    {
        public GetRegionValidation()
        {
            RuleFor(x => x.regionId).NotEmpty();
        }
    }
}
