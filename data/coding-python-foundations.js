import {makePythonProblem} from "./coding-python-utils.js";
const definitions=[
 [
  2,
  "print(\"Hello World\")",
  {
   "trace": "출력문 → Hello World"
  }
 ],
 [
  3,
  "print(\"Python\")\nprint(\"First Step\")",
  {
   "trace": "1행 → Python|2행 → First Step"
  }
 ],
 [
  4,
  "n = int(input())\nprint(n)",
  {
   "trace": "n:입력 문자열 '-12' → 정수 -12|출력 → -12"
  }
 ],
 [
  5,
  "x = float(input())\nprint(f\"{x:.2f}\")",
  {
   "trace": "x:문자열 '3.5' → 실수 3.5|출력 형식 → 3.50"
  }
 ],
 [
  6,
  "a, b = map(int, input().split())\nprint(a)\nprint(b)",
  {
   "trace": "a=7, b=9|첫 print → 7|둘째 print → 9"
  }
 ],
 [
  7,
  "ch = input()\nprint(ch)",
  {
   "trace": "ch:입력 → 'Z'|print → Z"
  }
 ],
 [
  8,
  "a, b, c = map(int, input().split())\ntotal = a + b + c\nprint(total)",
  {
   "trace": "a=1, b=2, c=3|total:미정→1+2+3=6|출력→6"
  }
 ],
 [
  9,
  "name = input().strip()\nprint(f\"Hello, {name}!\")",
  {
   "trace": "name:문자열 'Mina' 입력|f-string 치환 → Hello, Mina!"
  }
 ],
 [
  10,
  "number, ch = input().split()\nprint(int(number), ch)",
  {
   "trace": "number='5', ch='A'|int(number): '5' → 5|출력 5 A"
  }
 ],
 [
  11,
  "n = int(input())\nsquare = n * n\nprint(square)",
  {
   "trace": "n=6|square:미정→6*6=36"
  }
 ],
 [
  12,
  "a, b = map(int, input().split())\ntotal = a + b\ndifference = a - b\nproduct = a * b\nprint(total)\nprint(difference)\nprint(product)",
  {
   "trace": "a=8,b=3|total=8+3→11|difference=8-3→5|product=8*3→24"
  }
 ],
 [
  13,
  "a, b = map(int, input().split())\nquotient = a // b\nremainder = a % b\nprint(quotient, remainder)",
  {
   "trace": "a=17,b=5|quotient:미정→3|remainder:미정→2"
  }
 ],
 [
  14,
  "width, height = map(int, input().split())\narea = width * height\nperimeter = 2 * (width + height)\nprint(area, perimeter)",
  {
   "trace": "width=3,height=5|area:미정→15|perimeter:미정→16"
  }
 ],
 [
  15,
  "base, height = map(float, input().split())\narea = base * height / 2\nprint(f\"{area:.1f}\")",
  {
   "trace": "base=3.0,height=4.0|area=3*4/2→6.0"
  }
 ],
 [
  16,
  "celsius = float(input())\nfahrenheit = celsius * 9 / 5 + 32\nprint(f\"{fahrenheit:.1f}\")",
  {
   "trace": "celsius=0.0|fahrenheit:미정→0*9/5+32=32.0"
  }
 ],
 [
  17,
  "seconds = int(input())\nhours = seconds // 3600\nminutes = (seconds % 3600) // 60\nremain = seconds % 60\nprint(hours, minutes, remain)",
  {
   "trace": "seconds=3671|hours=3671//3600→1|minutes=71//60→1|remain=3671%60→11"
  }
 ],
 [
  18,
  "a, b = map(int, input().split())\ntemp = a\na = b\nb = temp\nprint(a, b)",
  {
   "trace": "a=10,b=20|temp:미정→10|a:10→20|b:20→10"
  }
 ],
 [
  19,
  "n = int(input())\nup = n + 1\ndown = n - 1\nprint(up, down)",
  {
   "trace": "n=5|up:미정→6|down:미정→4"
  }
 ],
 [
  20,
  "n = int(input())\nn += 3\nn *= 2\nn -= 4\nprint(n)",
  {
   "trace": "n:입력→5|n:5→8|n:8→16|n:16→12"
  }
 ],
 [
  21,
  "n = int(input())\nif n > 0:\n    print(\"POSITIVE\")\nelif n < 0:\n    print(\"NEGATIVE\")\nelse:\n    print(\"ZERO\")",
  {
   "trace": "n=-3|n>0 거짓|n<0 참 → NEGATIVE"
  }
 ],
 [
  22,
  "a, b = map(int, input().split())\nif a > b:\n    print(a)\nelse:\n    print(b)",
  {
   "trace": "a=3,b=8|a>b 거짓|else → 8"
  }
 ],
 [
  23,
  "a, b, c = map(int, input().split())\nbest = a\nif b > best:\n    best = b\nif c > best:\n    best = c\nprint(best)",
  {
   "trace": "best:미정→5|best:5→12 (b 비교)|c=9이므로 best=12 유지"
  }
 ],
 [
  24,
  "n = int(input())\nif n % 2 == 0:\n    print(\"EVEN\")\nelse:\n    print(\"ODD\")",
  {
   "trace": "n=7|7%2=1 → 조건 거짓|ODD 출력"
  }
 ],
 [
  25,
  "score = int(input())\nif score >= 90:\n    grade = \"A\"\nelif score >= 80:\n    grade = \"B\"\nelif score >= 70:\n    grade = \"C\"\nelif score >= 60:\n    grade = \"D\"\nelse:\n    grade = \"F\"\nprint(grade)",
  {
   "trace": "score=85|85>=90 거짓|85>=80 참 → grade='B'"
  }
 ],
 [
  26,
  "year = int(input())\nleap = (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0)\nprint(\"LEAP\" if leap else \"COMMON\")",
  {
   "trace": "year=2000|year%400=0 참|leap:미정→True → LEAP"
  }
 ],
 [
  27,
  "age = int(input())\nif age >= 19:\n    print(\"ADULT\")\nelse:\n    print(\"MINOR\")",
  {
   "trace": "age=18|18>=19 거짓 → MINOR"
  }
 ],
 [
  28,
  "n = int(input())\nif n % 3 == 0 and n % 5 == 0:\n    print(\"YES\")\nelse:\n    print(\"NO\")",
  {
   "trace": "n=30|30%3=0 참|30%5=0 참 → YES"
  }
 ],
 [
  29,
  "a, b = map(int, input().split())\nif a > b:\n    print(\">\")\nelif a < b:\n    print(\"<\")\nelse:\n    print(\"=\")",
  {
   "trace": "a=5,b=7|a>b 거짓|a<b 참 → <"
  }
 ],
 [
  30,
  "menu, a, b = map(int, input().split())\nif menu == 1:\n    result = a + b\nelif menu == 2:\n    result = a - b\nelif menu == 3:\n    result = a * b\nelse:\n    result = a // b\nprint(result)",
  {
   "trace": "menu=1,a=7,b=2|menu==1 참|result:미정→9"
  }
 ],
 [
  31,
  "n = int(input())\nprint(\"IN\" if 1 <= n <= 100 else \"OUT\")",
  {
   "trace": "n=100|1<=100<=100 참 → IN"
  }
 ],
 [
  32,
  "ch = input()\nif \"A\" <= ch <= \"Z\":\n    print(\"UPPER\")\nelse:\n    print(\"OTHER\")",
  {
   "trace": "ch='G'|A<=G<=Z 참 → UPPER"
  }
 ],
 [
  33,
  "a, b, c, d = map(int, input().split())\nsmallest = a\nif b < smallest:\n    smallest = b\nif c < smallest:\n    smallest = c\nif d < smallest:\n    smallest = d\nprint(smallest)",
  {
   "trace": "smallest:미정→5|smallest:5→-1 (b=-1)|c=4,d=2 → -1 유지"
  }
 ],
 [
  34,
  "year, month = map(int, input().split())\nleap = year % 400 == 0 or (year % 4 == 0 and year % 100 != 0)\ndays = 31\nif month == 2:\n    days = 29 if leap else 28\nelif month in (4, 6, 9, 11):\n    days = 30\nprint(days)",
  {
   "trace": "year=2024,month=2|leap=True|days:31→29"
  }
 ],
 [
  35,
  "price = int(input())\nif price >= 50000:\n    rate = 10\nelif price >= 10000:\n    rate = 5\nelse:\n    rate = 0\ndiscount = price * rate // 100\npayment = price - discount\nprint(payment)",
  {
   "trace": "price=20000|rate:미정→5|discount=20000*5//100→1000|payment=20000-1000→19000"
  }
 ],
 [
  36,
  "n = int(input())\nresult = []\nfor i in range(1, n + 1):\n    result.append(str(i))\nprint(\" \".join(result))",
  {
   "trace": "n=5|i=1,result:[]→['1']|i=2,result:['1']→['1','2']|i=5,result→['1','2','3','4','5']"
  }
 ],
 [
  37,
  "n = int(input())\nresult = []\nfor i in range(n, 0, -1):\n    result.append(str(i))\nprint(\" \".join(result))",
  {
   "trace": "n=4|i:4→3→2→1|result:[]→['4','3','2','1']"
  }
 ],
 [
  38,
  "n = int(input())\nresult = []\nfor i in range(2, n + 1, 2):\n    result.append(str(i))\nprint(\" \".join(result))",
  {
   "trace": "n=8|i:2→4→6→8|result:[]→['2','4','6','8']"
  }
 ],
 [
  39,
  "n = int(input())\nresult = []\nfor i in range(3, n + 1, 3):\n    result.append(str(i))\nprint(\" \".join(result))",
  {
   "trace": "n=11|i:3→6→9|result:[]→['3','6','9']"
  }
 ],
 [
  40,
  "n = int(input())\ntotal = 0\nfor i in range(1, n + 1, 2):\n    total += i\nprint(total)",
  {
   "trace": "total:0→1 (i=1)|total:1→4 (i=3)|total:4→9 (i=5)|total:9→16 (i=7)"
  }
 ],
 [
  42,
  "n = int(input())\nproduct = 1\nfor i in range(2, n + 1):\n    product *= i\nprint(product)",
  {
   "trace": "product=1|i=2 → product:1→2|i=3 → product:2→6|i=4 → product:6→24|i=5 → product:24→120"
  }
 ],
 [
  43,
  "a, b = map(int, input().split())\nresult = 1\nfor i in range(b):\n    result *= a\nprint(result)",
  {
   "trace": "a=2,b=4,result=1|i=0,result:1→2|i=1,result:2→4|i=2,result:4→8|i=3,result:8→16"
  }
 ],
 [
  44,
  "n = int(input())\nfor i in range(1, 10):\n    print(f\"{n}*{i}={n*i}\")",
  {
   "trace": "n=2|i=1 → 2*1=2|i=2 → 2*2=4|i=9 → 2*9=18"
  }
 ],
 [
  45,
  "for dan in range(2, 10):\n    for i in range(1, 10):\n        print(f\"{dan}*{i}={dan*i}\")",
  {
   "trace": "dan=2,i=1→2*1=2|dan=2,i=9→2*9=18|dan=3,i=1→3*1=3|dan=9,i=9→9*9=81"
  }
 ],
 [
  46,
  "rows, cols = map(int, input().split())\nfor r in range(rows):\n    line = \"\"\n    for c in range(cols):\n        line += \"*\"\n    print(line)",
  {
   "trace": "rows=2,cols=3|r=0,line:''→'*'→'**'→'***'|r=1,line:''→'*'→'**'→'***'"
  }
 ],
 [
  47,
  "n = int(input())\nfor r in range(1, n + 1):\n    line = \"\"\n    for c in range(r):\n        line += \"*\"\n    print(line)",
  {
   "trace": "n=3|r=1 line:''→'*'|r=2 line:''→'*'→'**'|r=3 line:''→'*'→'**'→'***'"
  }
 ],
 [
  48,
  "n = int(input())\nfor r in range(n, 0, -1):\n    line = \"\"\n    for c in range(r):\n        line += \"*\"\n    print(line)",
  {
   "trace": "n=3|r=3 → ***|r=2 → **|r=1 → *"
  }
 ],
 [
  49,
  "n = int(input())\ndigits = 0\nwhile True:\n    digits += 1\n    n //= 10\n    if n == 0:\n        break\nprint(digits)",
  {
   "trace": "n=1200,digits=0|n:1200→120,digits:0→1|n:120→12,digits:1→2|n:12→1,digits:2→3|n:1→0,digits:3→4"
  }
 ],
 [
  50,
  "n = int(input())\nreversed_number = 0\nwhile True:\n    digit = n % 10\n    reversed_number = reversed_number * 10 + digit\n    n //= 10\n    if n == 0:\n        break\nprint(reversed_number)",
  {
   "trace": "n=120,reversed_number=0|digit=0 → reversed_number=0,n:120→12|digit=2 → reversed_number:0→2,n:12→1|digit=1 → reversed_number:2→21,n:1→0"
  }
 ]
];
export const pythonFoundationProblems=definitions.map(([n,code,opts])=>makePythonProblem(n,code,opts));
