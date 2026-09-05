static class ListNode { int val; ListNode next; ListNode(int v) { val=v; } }
static class TreeNode { int val; TreeNode left,right; TreeNode(int v) { val=v; } }
static int checks;
static void verify(boolean condition,String label) { checks++; if(!condition) throw new AssertionError(label); }
static ListNode list(int... a) { ListNode h=new ListNode(0),t=h; for(int x:a){t.next=new ListNode(x);t=t.next;} return h.next; }
static List<Integer> values(ListNode h) { List<Integer> a=new ArrayList<>(); while(h!=null){if(a.size()>1000)throw new AssertionError("cycle in merged output");a.add(h.val);h=h.next;}return a; }
static Set<String> canonical(List<List<Integer>> rows){Set<String> out=new TreeSet<>(); for(List<Integer> row:rows)out.add(row.toString());return out;}
static Set<String> bruteThree(int[] a){Set<String>s=new TreeSet<>();for(int i=0;i<a.length;i++)for(int j=i+1;j<a.length;j++)for(int k=j+1;k<a.length;k++)if((long)a[i]+a[j]+a[k]==0){int[]v={a[i],a[j],a[k]};Arrays.sort(v);s.add(Arrays.toString(v));}return s;}
static long bruteArea(int[] a){long v=0;for(int i=0;i<a.length;i++)for(int j=i+1;j<a.length;j++)v=Math.max(v,(long)Math.min(a[i],a[j])*(j-i));return v;}
static long bruteWater(int[] a){long v=0;for(int i=0;i<a.length;i++){int l=0,r=0;for(int j=0;j<=i;j++)l=Math.max(l,a[j]);for(int j=i;j<a.length;j++)r=Math.max(r,a[j]);v+=Math.min(l,r)-a[i];}return v;}
static long bruteCount(int[] a,long k){long v=0;for(int i=0;i<a.length;i++){long sum=0;for(int j=i;j<a.length;j++){sum+=a[j];if(sum==k)v++;}}return v;}
static int bruteLIS(int[] a){int best=0;for(int mask=0;mask<(1<<a.length);mask++){long prev=Long.MIN_VALUE;int len=0;boolean ok=true;for(int i=0;i<a.length;i++)if((mask&(1<<i))!=0){if(a[i]<=prev)ok=false;prev=a[i];len++;}if(ok)best=Math.max(best,len);}return best;}
static long bruteKnapsack(int[] w,int[] v,int cap){long best=0;for(int mask=0;mask<(1<<w.length);mask++){int weight=0;long value=0;for(int i=0;i<w.length;i++)if((mask&(1<<i))!=0){weight+=w[i];value+=v[i];}if(weight<=cap)best=Math.max(best,value);}return best;}
static boolean bruteJump(int[] a){if(a.length==0)return false;boolean[]d=new boolean[a.length];d[0]=true;for(int i=0;i<a.length;i++)if(d[i])for(int j=i+1;j<a.length&&j<=(long)i+a[i];j++)d[j]=true;return d[a.length-1];}
static long bruteMaxSub(int[] a){if(a.length==0)return 0;long best=Long.MIN_VALUE;for(int i=0;i<a.length;i++){long sum=0;for(int j=i;j<a.length;j++){sum+=a[j];best=Math.max(best,sum);}}return best;}
static String bruteWindow(String s,String t){if(t.isEmpty())return "";int[]need=new int[128];for(char c:t.toCharArray())need[c]++;String best="";for(int i=0;i<s.length();i++){int[]have=new int[128];for(int j=i;j<s.length();j++){have[s.charAt(j)]++;boolean ok=true;for(int c=0;c<128;c++)if(have[c]<need[c])ok=false;if(ok&&(best.isEmpty()||j-i+1<best.length()))best=s.substring(i,j+1);}}return best;}
static String randomString(Random random,int n){StringBuilder b=new StringBuilder();for(int i=0;i<n;i++)b.append((char)('A'+random.nextInt(3)));return b.toString();}
public static void main(String[] args){
    verify(canonical(threeSum(new int[]{-1,0,1,2,-1,-4})).equals(Set.of("[-1, -1, 2]","[-1, 0, 1]")),"three sum");
    verify(threeSum(new int[]{0,0,0,0}).size()==1,"three sum duplicates");
    verify(threeSum(new int[]{Integer.MAX_VALUE,Integer.MAX_VALUE,2}).isEmpty(),"three sum overflow");
    verify(maxArea(new int[]{1,8,6,2,5,4,8,3,7})==49,"container");
    verify(maxArea(new int[]{Integer.MAX_VALUE,0,Integer.MAX_VALUE})==4294967294L,"area long");
    verify(trap(new int[]{4,2,0,3,2,5})==9,"rain");
    verify(trap(new int[]{})==0,"rain empty");
    verify(minWindow("ADOBECODEBANC","ABC").equals("BANC"),"window");
    verify(minWindow("a","aa").equals(""),"window insufficient");
    verify(minWindow("AAABBC","AABC").equals("AABBC"),"window multiplicity");
    verify(subarraySum(new int[]{0,0,0},0)==6,"prefix zero");
    verify(subarraySum(new int[]{Integer.MAX_VALUE,1},2147483648L)==1,"prefix long");
    verify(Arrays.equals(dailyTemperatures(new int[]{73,74,75,71,69,72,76,73}),new int[]{1,1,4,2,1,1,0,0}),"temperature");
    verify(Arrays.equals(dailyTemperatures(new int[]{5,5,4}),new int[]{0,0,0}),"strictly warmer");
    verify(Arrays.deepEquals(mergeIntervals(new int[][]{{1,3},{2,6},{8,10},{15,18}}),new int[][]{{1,6},{8,10},{15,18}}),"merge");
    verify(Arrays.deepEquals(mergeIntervals(new int[][]{{1,4},{4,5}}),new int[][]{{1,5}}),"merge touching");
    verify(mergeIntervals(new int[][]{}).length==0,"merge empty");
    ListNode cycle=list(1,2,3);cycle.next.next.next=cycle.next;
    verify(hasCycle(cycle)&&!hasCycle(list(1,2))&&!hasCycle(null),"cycle detection");
    verify(values(mergeKLists(new ListNode[]{list(1,4,5),list(1,3,4),list(2,6)})).equals(List.of(1,1,2,3,4,4,5,6)),"merge k lists");
    verify(mergeKLists(new ListNode[]{null,null})==null,"merge empty lists");
    TreeNode root=new TreeNode(3);root.left=new TreeNode(5);root.right=new TreeNode(1);root.left.right=new TreeNode(2);
    verify(lowestCommonAncestor(root,root.left,root.right)==root,"LCA two branches");
    verify(lowestCommonAncestor(root,root.left,root.left.right)==root.left,"LCA ancestor");
    verify(numIslands(new char[][]{"110".toCharArray(),"010".toCharArray(),"001".toCharArray()})==2,"islands no diagonal");
    verify(numIslands(new char[][]{})==0,"islands empty");
    var permutations=permute(new int[]{1,2,3});verify(permutations.size()==6&&canonical(permutations).size()==6,"permutations");
    verify(permute(new int[]{}).equals(List.of(List.of())),"empty permutation");
    var sets=subsets(new int[]{1,2,3});verify(sets.size()==8&&canonical(sets).size()==8,"subsets");
    verify(canonical(combinationSum(new int[]{2,3,6,7},7)).equals(Set.of("[2, 2, 3]","[7]")),"combinations");
    verify(combinationSum(new int[]{2},1).isEmpty(),"combination impossible");
    verify(combinationSum(new int[]{2},0).equals(List.of(List.of())),"zero target");
    boolean rejected=false;try{combinationSum(new int[]{0,2},2);}catch(IllegalArgumentException e){rejected=true;}verify(rejected,"zero candidate rejected");
    verify(lengthOfLIS(new int[]{10,9,2,5,3,7,101,18})==4,"LIS");
    verify(lengthOfLIS(new int[]{2,2,2})==1,"LIS strict");
    verify(lengthOfLCS("abcde","ace")==3&&lengthOfLCS("","abc")==0,"LCS");
    verify(rob(new int[]{2,7,9,3,1})==12,"rob");
    verify(knapsack01(new int[]{2},new int[]{3},4)==3,"01 not unbounded");
    verify(knapsack01(new int[]{2,3,4},new int[]{4,5,7},5)==9,"knapsack");
    verify(canJump(new int[]{2,3,1,1,4})&&!canJump(new int[]{3,2,1,0,4}),"jump");
    verify(canJump(new int[]{0})&&!canJump(new int[]{}),"jump boundary");
    verify(eraseOverlapIntervals(new int[][]{{1,2},{2,3},{3,4},{1,3}})==1,"interval selection");
    verify(maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4})==6,"max subarray");
    verify(maxSubArray(new int[]{-5,-2,-7})==-2,"all negative");
    Random random=new Random(20260905L);
    for(int trial=0;trial<400;trial++){
        int n=random.nextInt(9);int[]a=new int[n],h=new int[n],w=new int[n],v=new int[n];
        for(int i=0;i<n;i++){a[i]=random.nextInt(11)-5;h[i]=random.nextInt(7);w[i]=random.nextInt(5)+1;v[i]=random.nextInt(11);}
        long k=random.nextInt(9)-4;int cap=random.nextInt(12);
        var triplets=threeSum(a);
        verify(canonical(triplets).equals(bruteThree(a))&&triplets.size()==canonical(triplets).size(),"random three sum "+Arrays.toString(a));
        verify(maxArea(h)==bruteArea(h),"random area "+Arrays.toString(h));
        verify(trap(h)==bruteWater(h),"random rain "+Arrays.toString(h));
        verify(subarraySum(a,k)==bruteCount(a,k),"random prefix "+Arrays.toString(a));
        verify(lengthOfLIS(a)==bruteLIS(a),"random LIS "+Arrays.toString(a));
        verify(knapsack01(w,v,cap)==bruteKnapsack(w,v,cap),"random knapsack");
        verify(canJump(h)==bruteJump(h),"random jump");
        verify(maxSubArray(a)==bruteMaxSub(a),"random maximum subarray");
        String s=randomString(random,random.nextInt(9)),t=randomString(random,random.nextInt(4));
        verify(minWindow(s,t).equals(bruteWindow(s,t)),"random window "+s+" / "+t);
    }
    System.out.println("Passed "+checks+" checks for 21 added problems; randomized oracle seed=20260905.");
}
