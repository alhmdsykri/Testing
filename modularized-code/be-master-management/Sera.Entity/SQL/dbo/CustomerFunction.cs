namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("CustomerFunction", Schema = "dbo")]
    public partial class CustomerFunction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int customerFunctionId { get; set; }
        public int customerContactId { get; set; }
        public string functionName { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
    }
}