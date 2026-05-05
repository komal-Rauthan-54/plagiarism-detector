import { CodeFile, Language } from '@/engine/types';

export const SAMPLE_FILES: CodeFile[] = [
  {
    id: 'sample_c',
    name: 'factorial.c',
    language: 'c' as Language,
    code: `#include <stdio.h>

int factorial(int n) {
    int result = 1;
    for (int i = 1; i <= n; i++) {
        result = result * i;
    }
    return result;
}

int main() {
    int num = 5;
    int fact = factorial(num);
    printf("Factorial: %d\\n", fact);
    return 0;
}`,
  },
  {
    id: 'sample_py',
    name: 'factorial.py',
    language: 'python' as Language,
    code: `def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result = result * i
    return result

num = 5
fact = factorial(num)
print("Factorial:", fact)`,
  },
  {
    id: 'sample_java',
    name: 'Factorial.java',
    language: 'java' as Language,
    code: `public class Factorial {
    public static int factorial(int n) {
        int result = 1;
        for (int i = 1; i <= n; i++) {
            result = result * i;
        }
        return result;
    }

    public static void main(String[] args) {
        int num = 5;
        int fact = factorial(num);
        System.out.println("Factorial: " + fact);
    }
}`,
  },
  {
    id: 'sample_cpp',
    name: 'factorial.cpp',
    language: 'cpp' as Language,
    code: `#include <iostream>
using namespace std;

int factorial(int n) {
    int result = 1;
    for (int i = 1; i <= n; i++) {
        result = result * i;
    }
    return result;
}

int main() {
    int num = 5;
    int fact = factorial(num);
    cout << "Factorial: " << fact << endl;
    return 0;
}`,
  },
  {
    id: 'sample_py_diff',
    name: 'sum_array.py',
    language: 'python' as Language,
    code: `def compute_sum(arr):
    total = 0
    for item in arr:
        total += item
    return total

numbers = [1, 2, 3, 4, 5]
result = compute_sum(numbers)
print("Sum:", result)`,
  },
];
