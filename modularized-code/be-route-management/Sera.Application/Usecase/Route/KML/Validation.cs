namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteKMLValidation : AbstractValidator<GetRouteKMLRequest>
    {
        public GetRouteKMLValidation()
        {
            RuleFor(x => x.routeId).NotEmpty();
        }
    }
}