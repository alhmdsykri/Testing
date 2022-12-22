namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetValidLocationValidation : AbstractValidator<GetValidLocationRequest>
    {
        public GetValidLocationValidation()
        {
            RuleFor(x => x.locationId).NotEmpty();
        }
    }
}