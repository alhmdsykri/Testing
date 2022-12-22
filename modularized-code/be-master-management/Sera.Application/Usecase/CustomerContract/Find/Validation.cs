namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindCustomerContractValidation :
        AbstractValidator<FindCustomerContractRequest>
    {
        public FindCustomerContractValidation()
        {
            RuleFor(x => x.status).Must(ValidateStatus).WithMessage(x => $"The value {x.status} is not valid for status");
            RuleFor(x => x.customerId).NotNull().NotEmpty();
        }

        private bool ValidateStatus(string? status)
        {
            if (status == null) { return true; }

            var lstStatus = status.Split(",").ToList();
            var total = lstStatus.Count;
            var count = 0;

            foreach (var x in lstStatus)
            {
                if (!int.TryParse(x, out int sts))
                {
                    count++;
                }
            }

            if (total == count) { return false; }

            return true;
        }
    }
}