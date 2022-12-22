namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetBUValidation : AbstractValidator<GetBURequest>
    {
        public GetBUValidation()
        {
            RuleFor(x => x.businessUnitId).NotEmpty();
        }
    }
}
