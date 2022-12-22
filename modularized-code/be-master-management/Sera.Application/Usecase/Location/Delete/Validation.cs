namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class DeleteLocationValidation : AbstractValidator<DeleteLocationRequest>
    {
        public DeleteLocationValidation()
        {
            RuleFor(x => x.locationId).NotEmpty();
        }
    }
}