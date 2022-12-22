namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("CustomerBusinessUnit", Schema = "dbo")]
    public partial class CustomerBusinessUnit
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int customerBusinessUnit1 { get; set; }
        public int customerId { get; set; }
        public int businessUnitId { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
    }
}