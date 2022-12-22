namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetActionValidation : AbstractValidator<GetRouteActionRequest>
    {
        public GetActionValidation()
        {
            RuleFor(x => x.prevNextAction).NotEmpty();
        }
    }
}