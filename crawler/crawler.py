from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import requests
import time
import os
from sys import exit as getout

PDF_FOLDER = 'result/'

chrome_options = webdriver.ChromeOptions()
for _ in ['disable-infobars', '--disable-extensions']:
    chrome_options.add_argument(_)
chrome_options.add_experimental_option(
"excludeSwitches", ["enable-logging"])
chrome_options.add_argument(
"user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.95 Safari/537.36")


driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
# 크롬 드라이버 경로 설정
driver.set_window_size(1600, 800)

# EBS 로그인 페이지로 이동
driver.get('https://www.ebsi.co.kr/ebs/pot/potl/login.ebs?destination=/ebs/xip/xipc/previousPaperList.ebs%3FtargetCd%3DD300&alertYn=N')


# driver.find_element(By.XPATH, "//*[@id=\"loginFrm\"]/input[11]").send_keys("")
# driver.find_element(By.XPATH, "//*[@id=\"loginFrm\"]/span/input").send_keys("")
# driver.find_element(By.XPATH, "//*[@id=\"btnLogin\"]").click()
input("로그인 후 엔터를 눌러주세요.")

driver.implicitly_wait(5)
driver.get('https://www.ebsi.co.kr/ebs/xip/xipc/previousPaperList.ebs?targetCd=D300')

# 연도와 영역 설정
select_begin_year = Select(driver.find_element(By.ID, 'beginYear'))
select_end_year = Select(driver.find_element(By.ID, 'endYear'))

select_begin_year.select_by_value('2017')
select_end_year.select_by_value('2024')

driver.find_element(By.ID, 'subj5').click()  # 사회탐구

time.sleep(5)

# 검색 버튼 클릭
driver.execute_script("search()")

time.sleep(5)

select_pageSize = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, 'pageSize')))
select_pageSize = Select(select_pageSize)
select_pageSize.select_by_value('50')

# 대기 시간 설정
time.sleep(5)

# 모의고사 목록 크롤링
html = driver.page_source
soup = BeautifulSoup(html, 'html.parser')
pagination = soup.select('div.pagination>div.count>a')[1]
max_page = int(pagination.text.strip())

# PDF 파일 저장 폴더
if not os.path.exists(PDF_FOLDER):
    os.makedirs(PDF_FOLDER)

# 파일 형식
#1. '##학년도 #월 '모평|학평 @@번'
#2. '##학년도 수능 @@번'
def create_filename(title):
    parts = title.split()
    # ex) 2023년 고3 10월 학평(서울) 경제
    # ex) 2023년 2024 대학수학능력시험 한국지리  
    year = int(parts[0].replace('년', ''))
    
    if '모평' in title or '학평' in title:
        month = parts[2].replace('월', '')
        
        if month == '3' or month == '4' or month == '7' or month == '10':
            academic_year = str(year)[-2:] + '학년도'
        elif month == '6' or month == '9':
            academic_year = str(year + 1)[-2:] + '학년도'
        else:
            raise ValueError(f"Unknown month: {month}")

        month = parts[2].replace('월', '')
        subject = parts[-1].replace('사회·문화', '사회문화')
        return f'{academic_year} {month}월 {subject}.pdf'
    elif '대학수학능력시험' in title:
        academic_year = str(year + 1)[-2:] + '학년도'
        exam_type = '수능'
        subject = parts[-1].replace('사회·문화', '사회문화')
        return f'{academic_year} {exam_type} {subject}.pdf'
    else:
        raise ValueError(f"Unknown title format: {title}")

for page in range(1, max_page + 1):
    # 페이지 이동
    driver.execute_script(f"goPage({page})")
    time.sleep(2)  # 페이지 로딩을 위한 대기 시간
    
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')
    papers = soup.select('div.board_qusesion>ul>li')
    
    for paper in papers:
        title = paper.select_one('div.txt_wrap div.txt_group p.tit').text.strip()
        # with open('titles.txt', 'a', encoding='utf-8') as file_data:
        #     file_data.write(f"{title}\n")

        pdf_filename = create_filename(title)
        pdf_path = os.path.join(PDF_FOLDER, pdf_filename)

        # 해설 파일 다운로드 링크 추출
        solution_button = paper.select_one('button[onclick*="goDownLoadH"]')
        if solution_button:
            onclick_text = solution_button['onclick']
            imgUrl = onclick_text.split("'")[1]

            # 전체 URL 생성
            full_url = f'https://wdown.ebsi.co.kr/W61001/01exam{imgUrl}'

            # 파일 다운로드
            response = requests.get(full_url)
            with open(pdf_path, 'wb') as f:
                f.write(response.content)

            print(f'{pdf_filename} 해설 다운로드 완료: {pdf_path}')
            time.sleep(0.1)
        else:
            print(f'해설 파일 링크를 찾을 수 없습니다: {title}')

driver.quit()
