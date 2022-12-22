namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteValidation : AbstractValidator<GetRouteRequest>
    {
        public GetRouteValidation()
        {
            RuleFor(x => x.routeId).NotEmpty();
        }
    }
}