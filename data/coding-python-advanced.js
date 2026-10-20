import {makePythonProblem} from "./coding-python-utils.js";
const definitions=[
 [
  51,
  "n = int(input())\ntotal = 0\nwhile True:\n    digit = n % 10\n    total += digit\n    n //= 10\n    if n == 0:\n        break\nprint(total)",
  {
   "trace": "n=248,total=0|digit=8,total:0→8,n:248→24|digit=4,total:8→12,n:24→2|digit=2,total:12→14,n:2→0"
  }
 ],
 [
  52,
  "n = int(input())\nprime = True\ndivisor = 2\nwhile divisor * divisor <= n:\n    if n % divisor == 0:\n        prime = False\n        break\n    divisor += 1\nprint(\"PRIME\" if prime else \"COMPOSITE\")",
  {
   "trace": "n=13,prime=True|divisor=2,13%2≠0|divisor:2→3,13%3≠0|divisor:3→4,4*4>13 종료 → PRIME"
  }
 ],
 [
  53,
  "n = int(input())\ncount = 0\nfor divisor in range(1, n + 1):\n    if n % divisor == 0:\n        count += 1\nprint(count)",
  {
   "trace": "n=12,count=0|divisor=1,count:0→1|divisor=2,count:1→2|divisor=3,count:2→3|divisor=4,count:3→4|divisor=6,count:4→5|divisor=12,count:5→6"
  }
 ],
 [
  54,
  "a, b = map(int, input().split())\nwhile b != 0:\n    remainder = a % b\n    a = b\n    b = remainder\nprint(a)",
  {
   "trace": "a=12,b=18|remainder=12,a:12→18,b:18→12|remainder=6,a:18→12,b:12→6|remainder=0,a:12→6,b:6→0"
  }
 ],
 [
  55,
  "a, b = map(int, input().split())\nx, y = a, b\nwhile y != 0:\n    remainder = x % y\n    x, y = y, remainder\nlcm = a // x * b\nprint(lcm)",
  {
   "trace": "a=12,b=18|x,y:(12,18)→(18,12)→(12,6)→(6,0)|gcd=x=6|lcm=12//6*18→36"
  }
 ],
 [
  56,
  "numbers = list(map(int, input().split()))\ntotal = 0\nfor value in numbers:\n    total += value\nprint(total)",
  {
   "trace": "numbers=[1,2,3,4,5]|total:0→1→3→6→10→15"
  }
 ],
 [
  57,
  "numbers = list(map(int, input().split()))\ntotal = 0\nfor value in numbers:\n    total += value\naverage = total / 5\nprint(f\"{average:.1f}\")",
  {
   "trace": "numbers=[1,2,3,4,5]|total:0→1→3→6→10→15|average:미정→3.0"
  }
 ],
 [
  58,
  "numbers = list(map(int, input().split()))\nmaximum = numbers[0]\nminimum = numbers[0]\nfor value in numbers[1:]:\n    if value > maximum:\n        maximum = value\n    if value < minimum:\n        minimum = value\nprint(maximum, minimum)",
  {
   "trace": "numbers=[5,-3,7,1,0]|maximum:5→7|minimum:5→-3|최종 7 -3"
  }
 ],
 [
  59,
  "numbers = list(map(int, input().split()))\ncount = 0\nfor value in numbers:\n    if value % 2 == 0:\n        count += 1\nprint(count)",
  {
   "trace": "numbers=[1,2,4,5,6]|count:0→1(value=2)|count:1→2(value=4)|count:2→3(value=6)"
  }
 ],
 [
  60,
  "numbers = list(map(int, input().split()))\nresult = []\nfor i in range(4, -1, -1):\n    result.append(numbers[i])\nprint(*result)",
  {
   "trace": "numbers=[1,2,3,4,5]|i:4→3→2→1→0|result:[]→[5]→[5,4]→[5,4,3,2,1]"
  }
 ],
 [
  61,
  "numbers = list(map(int, input().split()))\ntarget = int(input())\nposition = -1\nfor i in range(5):\n    if numbers[i] == target:\n        position = i\n        break\nprint(position)",
  {
   "trace": "numbers=[1,4,4,5,6],target=4|position=-1|i=0 불일치|i=1 일치 → position:-1→1"
  }
 ],
 [
  62,
  "numbers = list(map(int, input().split()))\nold, new = map(int, input().split())\nfor i in range(5):\n    if numbers[i] == old:\n        numbers[i] = new\nprint(*numbers)",
  {
   "trace": "numbers=[1,2,1,4,5],old=1,new=9|numbers[0]:1→9|numbers[2]:1→9|결과 [9,2,9,4,5]"
  }
 ],
 [
  63,
  "numbers = list(map(int, input().split()))\ndiffs = []\nfor i in range(4):\n    difference = numbers[i + 1] - numbers[i]\n    diffs.append(difference)\nprint(*diffs)",
  {
   "trace": "numbers=[1,3,6,10,15]|difference:2→3→4→5|diffs:[]→[2]→[2,3]→[2,3,4]→[2,3,4,5]"
  }
 ],
 [
  64,
  "numbers = list(map(int, input().split()))\nfor step in range(4):\n    for j in range(4 - step):\n        if numbers[j] > numbers[j + 1]:\n            temp = numbers[j]\n            numbers[j] = numbers[j + 1]\n            numbers[j + 1] = temp\nprint(*numbers)",
  {
   "trace": "numbers 초기 [5,1,3,2,4]|step=0 종료 [1,3,2,4,5]|step=1 종료 [1,2,3,4,5]|나머지는 변경 없음"
  }
 ],
 [
  65,
  "values = list(map(int, input().split()))\nmatrix = [values[0:3], values[3:6]]\ntotals = []\nfor row in matrix:\n    row_sum = 0\n    for value in row:\n        row_sum += value\n    totals.append(row_sum)\nprint(*totals)",
  {
   "trace": "matrix=[[1,2,3],[4,5,6]]|첫 행 row_sum:0→1→3→6, totals:[]→[6]|둘째 행 row_sum:0→4→9→15, totals:[6]→[6,15]"
  }
 ],
 [
  66,
  "ch = input()\ncode = ord(ch)\nprint(code)",
  {
   "trace": "ch='A'|ord('A')=65 → code=65"
  }
 ],
 [
  67,
  "ch = input()\nupper = ch.upper()\nprint(upper)",
  {
   "trace": "ch='b'|upper:미정→'B'"
  }
 ],
 [
  68,
  "ch = input()\nif \"0\" <= ch <= \"9\":\n    print(\"DIGIT\")\nelse:\n    print(\"OTHER\")",
  {
   "trace": "ch='7'|0<=7<=9 참 → DIGIT"
  }
 ],
 [
  69,
  "word = input()\nprint(word)",
  {
   "trace": "word:미정→'code'|출력→code"
  }
 ],
 [
  70,
  "word = input()\nlength = 0\nfor ch in word:\n    length += 1\nprint(length)",
  {
   "trace": "word='hello'|length:0→1(h)→2(e)→3(l)→4(l)→5(o)"
  }
 ],
 [
  71,
  "numbers = list(map(int, input().split()))\nfirst = numbers[:3]\nprint(*first)",
  {
   "trace": "numbers=[1,2,3,4,5]|first:미정→[1,2,3]|원본 유지"
  }
 ],
 [
  72,
  "numbers = list(map(int, input().split()))\nlast = numbers[-2:]\nprint(*last)",
  {
   "trace": "numbers=[1,2,3,4,5]|last:미정→[4,5]|음수 인덱스 -2,-1"
  }
 ],
 [
  73,
  "numbers = list(map(int, input().split()))\nextra = list(map(int, input().split()))\nfor value in extra:\n    numbers.append(value)\nprint(*numbers)",
  {
   "trace": "numbers=[1,2,3],extra=[4,5]|append(4):numbers→[1,2,3,4]|append(5):numbers→[1,2,3,4,5]"
  }
 ],
 [
  74,
  "numbers = list(map(int, input().split()))\nordered = sorted(numbers)\nprint(*ordered)",
  {
   "trace": "numbers=[5,2,4,1,3]|ordered:미정→[1,2,3,4,5]|numbers는 변경되지 않음"
  }
 ],
 [
  75,
  "numbers = list(map(int, input().split()))\ncopied = numbers.copy()\nnumbers[0] = 99\nprint(copied[0], numbers[0])",
  {
   "trace": "numbers=[1,2,3]|copied:미정→[1,2,3] (별도 리스트)|numbers[0]:1→99|copied[0]=1 유지, numbers[0]=99",
   "explanation": "copy()는 새 리스트를 생성합니다. 정수 원소를 복사하므로 원본의 첫 원소를 수정해도 복사본의 첫 원소는 1로 유지됩니다."
  }
 ],
 [
  76,
  "numbers = tuple(map(int, input().split()))\nprint(numbers[0], numbers[-1])",
  {
   "trace": "numbers=(1,2,3)|numbers[0]=1,numbers[-1]=3"
  }
 ],
 [
  77,
  "pair = tuple(map(int, input().split()))\na, b = pair\nresult = a - b\nprint(result)",
  {
   "trace": "pair=(9,4)|a:미정→9,b:미정→4|result:미정→5"
  }
 ],
 [
  78,
  "numbers = list(map(int, input().split()))\nsquared = [value * value for value in numbers]\nprint(*squared)",
  {
   "trace": "numbers=[1,-2,3,-4,5]|squared=[1,4,9,16,25]|원본 numbers 유지"
  }
 ],
 [
  79,
  "numbers = list(map(int, input().split()))\nevens = [value for value in numbers if value % 2 == 0]\nif evens:\n    print(*evens)\nelse:\n    print(\"EMPTY\")",
  {
   "trace": "numbers=[1,2,3,4,5]|2와 4가 조건 참 → evens=[2,4]|EMPTY 분기는 실행하지 않음"
  }
 ],
 [
  80,
  "numbers = list(map(int, input().split()))\nnumbers.sort(reverse=True)\nprint(*numbers)",
  {
   "trace": "numbers=[5,2,4,1,3]|sort(reverse=True) 후 numbers→[5,4,3,2,1]|sort 반환값은 None"
  }
 ],
 [
  81,
  "tokens = input().split()\nscores = {}\nfor i in range(0, 6, 2):\n    scores[tokens[i]] = int(tokens[i + 1])\nquery = input()\nprint(scores.get(query, -1))",
  {
   "trace": "scores={}→{'Kim':90}→{'Kim':90,'Lee':80}→{'Kim':90,'Lee':80,'Park':70}|query='Lee'|scores.get('Lee',-1)→80"
  }
 ],
 [
  82,
  "word = input()\ncounts = {}\nfor ch in word:\n    counts[ch] = counts.get(ch, 0) + 1\nfor ch in sorted(counts):\n    print(f\"{ch}:{counts[ch]}\")",
  {
   "trace": "word='aba'|counts:{}→{'a':1}→{'a':1,'b':1}→{'a':2,'b':1}|sorted 키 a,b 출력"
  }
 ],
 [
  83,
  "tokens = input().split()\nscores = {tokens[0]: int(tokens[1]), tokens[2]: int(tokens[3])}\nname, value = input().split()\nscores[name] = int(value)\nprint(scores[name])",
  {
   "trace": "scores={'Kim':80,'Lee':70}|name='Kim',value='90'|scores['Kim']:80→90"
  }
 ],
 [
  84,
  "tokens = input().split()\nscores = {}\nfor i in range(0, 6, 2):\n    scores[tokens[i]] = int(tokens[i + 1])\nbest_name = \"\"\nbest_score = -1\nfor name, score in scores.items():\n    if score > best_score:\n        best_name = name\n        best_score = score\nprint(best_name)",
  {
   "trace": "scores={'Kim':90,'Lee':75,'Park':90}|best_score:-1→90,best_name:''→'Kim'|75는 작고 90 동점은 변경 안함 → Kim"
  }
 ],
 [
  85,
  "tokens = input().split()\nscores = {}\nfor i in range(0, 6, 2):\n    scores[tokens[i]] = int(tokens[i + 1])\nnames = sorted(scores)\nprint(*names)",
  {
   "trace": "scores={'banana':2,'apple':3,'cherry':1}|names:미정→['apple','banana','cherry']"
  }
 ],
 [
  86,
  "numbers = list(map(int, input().split()))\nunique = set(numbers)\nprint(len(unique))",
  {
   "trace": "numbers=[1,2,1,3,2]|unique={1,2,3}|len(unique)=3"
  }
 ],
 [
  87,
  "first = set(map(int, input().split()))\nsecond = set(map(int, input().split()))\ncommon = sorted(first & second)\nif common:\n    print(*common)\nelse:\n    print(\"EMPTY\")",
  {
   "trace": "first={1,2,3,4},second={3,4,5,6}|first & second={3,4}|common=[3,4]"
  }
 ],
 [
  88,
  "first = set(map(int, input().split()))\nsecond = set(map(int, input().split()))\ncombined = sorted(first | second)\nprint(*combined)",
  {
   "trace": "first={1,2,3,4},second={3,4,5,6}|합집합={1,2,3,4,5,6}|combined 정렬 후 출력"
  }
 ],
 [
  89,
  "first = set(map(int, input().split()))\nsecond = set(map(int, input().split()))\ndifference = sorted(first - second)\nif difference:\n    print(*difference)\nelse:\n    print(\"EMPTY\")",
  {
   "trace": "first={1,2,3,4},second={3,4,5,6}|차집합={1,2}|difference=[1,2]"
  }
 ],
 [
  90,
  "word = input()\ncounts = {}\nfor ch in word:\n    counts[ch] = counts.get(ch, 0) + 1\nbest = max(counts.values())\ncandidates = [ch for ch, count in counts.items() if count == best]\nprint(min(candidates))",
  {
   "trace": "word='banana'|counts={'b':1,'a':3,'n':2}|best=3|candidates=['a'] → 출력 a"
  }
 ],
 [
  91,
  "n = int(input())\nresult = square(n)\nprint(result)",
  {
   "prefix": "def square(n):\n    return n * n",
   "trace": "n=5|square(5):5*5→25|result=25"
  }
 ],
 [
  92,
  "a, b = map(int, input().split())\nresult = max2(a, b)\nprint(result)",
  {
   "prefix": "def max2(a, b):\n    if a > b:\n        return a\n    return b",
   "trace": "a=3,b=9|max2(3,9):3>9 거짓|return b=9 → result=9"
  }
 ],
 [
  93,
  "n = int(input())\nresult = is_even(n)\nprint(\"EVEN\" if result else \"ODD\")",
  {
   "prefix": "def is_even(n):\n    return n % 2 == 0",
   "trace": "n=8|is_even(8):8%2=0 참 → True|EVEN 출력"
  }
 ],
 [
  94,
  "n = int(input())\nresult = sum_to(n)\nprint(result)",
  {
   "prefix": "def sum_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total",
   "trace": "sum_to(4):total=0|i=1 total:0→1|i=2 total:1→3|i=3 total:3→6|i=4 total:6→10|return 10"
  }
 ],
 [
  95,
  "n = int(input())\nresult = factorial(n)\nprint(result)",
  {
   "prefix": "def factorial(n):\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result",
   "trace": "factorial(4):result=1|i=2 result:1→2|i=3 result:2→6|i=4 result:6→24|return 24"
  }
 ],
 [
  96,
  "a, b = map(int, input().split())\nresult = gcd(a, b)\nprint(result)",
  {
   "prefix": "def gcd(a, b):\n    while b != 0:\n        remainder = a % b\n        a, b = b, remainder\n    return a",
   "trace": "gcd(24,36):a,b=(24,36)|a,b:(24,36)→(36,24)→(24,12)→(12,0)|return 12"
  }
 ],
 [
  97,
  "numbers = list(map(int, input().split()))\nresult = sum_list(numbers)\nprint(result)",
  {
   "prefix": "def sum_list(values):\n    total = 0\n    for value in values:\n        total += value\n    return total",
   "trace": "numbers=[1,2,3,4,5]|함수 total:0→1→3→6→10→15|return 15"
  }
 ],
 [
  98,
  "numbers = list(map(int, input().split()))\nchanged = change_first(numbers)\nprint(numbers[0], changed[0])",
  {
   "prefix": "def change_first(values):\n    copied = values.copy()\n    copied[0] = 99\n    return copied",
   "trace": "numbers=[1,2,3]|함수 copied=[1,2,3] 별도 생성|copied[0]:1→99|원본 numbers[0]=1 유지"
  }
 ],
 [
  99,
  "a, b, menu = map(int, input().split())\nif menu == 1:\n    result = add(a, b)\nelif menu == 2:\n    result = sub(a, b)\nelse:\n    result = mul(a, b)\nprint(result)",
  {
   "prefix": "def add(a, b):\n    return a + b\n\ndef sub(a, b):\n    return a - b\n\ndef mul(a, b):\n    return a * b",
   "trace": "a=4,b=2,menu=3|mul(4,2):4*2→8|result=8"
  }
 ],
 [
  100,
  "scores = list(map(int, input().split()))\naverage, highest = analyze(scores)\nprint(f\"{average:.1f}\", highest)",
  {
   "prefix": "def analyze(scores):\n    total = 0\n    best = scores[0]\n    for score in scores:\n        total += score\n        if score > best:\n            best = score\n    return total / len(scores), best",
   "trace": "scores=[80,90,100,70,60]|total:0→80→170→270→340→400|best:80→90→100|average:400/5→80.0"
  }
 ]
];
export const pythonAdvancedProblems=definitions.map(([n,code,opts])=>makePythonProblem(n,code,opts));
