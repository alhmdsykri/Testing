namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("CustomerContact", Schema = "dbo")]

    public partial class CustomerContact
    {
        public CustomerContact()
        {
            CustomerFunction = new HashSet<CustomerFunction>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int customerContactId { get; set; }
        public int customerId { get; set; }
        public string? customerContactCode { get; set; }
        public string contactName { get; set; }
        public string phoneNumber { get; set; }
        public string email { get; set; }
        public string? position { get; set; }
        public string? department { get; set; }
        public string? remarks { get; set; }
        public bool isPIC { get; set; }
        public string? function { get; set; }
        public int status { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public string? transactionId { get; set; }
        public DateTime? persistedDate { get; set; }
        public DateTime? dataStoreTime { get; set; }
        public DateTime? sapMssqlSinkTime { get; set; }
        public Customer Customer { get; set; }
        public ICollection<CustomerFunction> CustomerFunction { get; set; }
    }
}