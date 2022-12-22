namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateRouteDetailFMSValidation : AbstractValidator<UpdateRouteDetailFMSRequest>
    {
        public UpdateRouteDetailFMSValidation()
        {
            RuleFor(x => x.routeId).NotEmpty();
        }
    }
}