namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class DeleteProductValidation : AbstractValidator<DeleteProductRequest>
    {
        public DeleteProductValidation()
        {
            RuleFor(x => x.productId).NotEmpty().GreaterThan(0);
        }
    }
}
