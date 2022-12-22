namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("RouteAction", Schema = "dbo")]
    public partial class RouteAction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int routeActionId { get; set; }
        public string name { get; set; }
        public DateTime createdAt { get; set; }
        public int createdBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public int modifiedBy { get; set; }
        public int status { get; set; }
        public int version { get; set; }
        public string transactionId { get; set; }
    }
}