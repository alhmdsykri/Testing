namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetProductValidation : AbstractValidator<GetProductRequest>
    {
        public GetProductValidation()
        {
            RuleFor(x => x.productId).NotEmpty();
        }
    }
}