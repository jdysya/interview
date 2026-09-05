static class ListNode {
    int val; ListNode next;
    ListNode(int val) { this.val = val; }
}
static class TreeNode {
    int val; TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}
static int checks = 0;
static void verify(boolean condition, String message) {
    checks++;
    if (!condition) throw new AssertionError(message);
}
public static void main(String[] args) {
    verify(Arrays.equals(twoSum(new int[]{4, 4}, 8),new int[]{0,1}),"two sum duplicate");
    verify(Arrays.equals(twoSum(new int[]{-5, 8, 2}, 3),new int[]{0,1}),"two sum negative");
    verify(twoSum(new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE}, -2).length==0,"two sum overflow");
    verify(twoSum(new int[]{4},8).length==0,"two sum same element");
    verify(longestUnique("")==0,"window empty");
    verify(longestUnique("abba")==2,"window left boundary");
    verify(longestUnique("🙂a🙂")==2,"window Unicode");
    verify(longestUnique("abcaef")==5,"window long");
    verify(reverseList(null)==null,"reverse empty");
    ListNode a=new ListNode(1), b=new ListNode(2), c=new ListNode(3);
    a.next=b;b.next=c;
    verify(reverseList(a)==c && c.next==b && b.next==a && a.next==null,"reverse links");
    verify(reverseList(c)==a && a.next==b && b.next==c && c.next==null,"reverse roundtrip");
    verify(binarySearch(new int[]{},7)==-1,"binary empty");
    verify(binarySearch(new int[]{1},1)==0,"binary singleton");
    verify(lowerBound(new int[]{1,3,3,8},3)==1,"binary first duplicate");
    verify(lowerBound(new int[]{1,3,8},9)==3,"binary after last");
    verify(binarySearch(new int[]{1,3,8},2)==-1,"binary missing");
    verify(levelOrder(null).isEmpty(),"tree empty");
    TreeNode root=new TreeNode(2);root.left=new TreeNode(1);root.right=new TreeNode(4);
    root.right.left=new TreeNode(3);
    verify(levelOrder(root).equals(List.of(List.of(2),List.of(1,4),List.of(3))),"tree levels");
    verify(canFinish(3,new int[][]{{1,0},{2,1}}),"graph acyclic");
    verify(!canFinish(2,new int[][]{{1,0},{0,1}}),"graph cycle");
    verify(!canFinish(1,new int[][]{{0,0}}),"graph self loop");
    verify(canFinish(4,new int[][]{}),"graph disconnected");
    verify(coinChange(new int[]{1,3,4},6)==2,"DP defeats greedy");
    verify(coinChange(new int[]{3},5)==-1,"DP unreachable");
    verify(coinChange(new int[]{2},0)==0,"DP zero");
    verify(kthLargest(new int[]{5,2,5,1},2)==5,"heap duplicates");
    verify(kthLargest(new int[]{-8,-1,-3},3)==-8,"heap negative");
    LRUCache cache=new LRUCache(2);
    cache.put(1,10);cache.put(2,20);
    verify(cache.get(1)==10,"LRU read");
    cache.put(3,30);
    verify(cache.get(2)==-1,"LRU read changes order");
    cache.put(1,11);cache.put(4,40);
    verify(cache.get(3)==-1 && cache.get(1)==11,"LRU update existing");
    LRUCache zero=new LRUCache(0);zero.put(1,1);
    verify(zero.get(1)==-1,"LRU zero capacity");
    LRUCache one=new LRUCache(1);one.put(1,1);one.put(2,2);
    verify(one.get(1)==-1 && one.get(2)==2,"LRU one capacity");
    System.out.println("Passed " + checks + " checks against Java code extracted from 9 published algorithm pages.");
}
