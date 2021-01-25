import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as moment from 'moment';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, getTestBed, TestBed, tick } from '@angular/core/testing';
import { MockComponent, MockDirective, MockPipe } from 'ng-mocks';
import { AlertComponent } from 'app/shared/alert/alert.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { JhiTranslateDirective } from 'ng-jhipster';
import { ArtemisDatePipe } from 'app/shared/pipes/artemis-date.pipe';
import { ArtemisTestModule } from '../../../test.module';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { QuizParticipationComponent } from 'app/exercises/quiz/participate/quiz-participation.component';
import { QuizParticipationService } from 'app/exercises/quiz/participate/quiz-participation.service';
import { MultipleChoiceQuestionComponent } from 'app/exercises/quiz/shared/questions/multiple-choice-question/multiple-choice-question.component';
import { DragAndDropQuestionComponent } from 'app/exercises/quiz/shared/questions/drag-and-drop-question/drag-and-drop-question.component';
import { ShortAnswerQuestionComponent } from 'app/exercises/quiz/shared/questions/short-answer-question/short-answer-question.component';
import { ButtonComponent } from 'app/shared/components/button.component';
import { JhiConnectionStatusComponent } from 'app/shared/connection-status/connection-status.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MockLocalStorageService } from '../../../helpers/mocks/service/mock-local-storage.service';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { MockSyncStorage } from '../../../helpers/mocks/service/mock-sync-storage.service';
import { MockTranslateService } from '../../../helpers/mocks/service/mock-translate.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SERVER_API_URL } from 'app/app.constants';
import { StudentParticipation } from 'app/entities/participation/student-participation.model';
import { QuizExercise } from 'app/entities/quiz/quiz-exercise.model';
import { QuizQuestion, QuizQuestionType } from 'app/entities/quiz/quiz-question.model';

chai.use(sinonChai);
const expect = chai.expect;

describe('QuizParticipationComponent', () => {
    let fixture: ComponentFixture<QuizParticipationComponent>;
    let component: QuizParticipationComponent;
    let participationService: QuizParticipationService;
    let httpMock: HttpTestingController;

    const now = moment();
    const question1 = { id: 1, type: QuizQuestionType.DRAG_AND_DROP, score: 1 } as QuizQuestion;
    const question2 = { id: 2, type: QuizQuestionType.MULTIPLE_CHOICE, score: 2 } as QuizQuestion;
    const question3 = { id: 3, type: QuizQuestionType.SHORT_ANSWER, score: 3 } as QuizQuestion;
    const quizExercise = (<any>{
        id: 2,
        quizQuestions: [question1, question2, question3],
        releaseDate: now.subtract(2, 'minutes'),
        adjustedReleaseDate: now.subtract(2, 'minutes'),
        dueDate: now.add(2, 'minutes'),
        adjustedDueDate: now.add(2, 'minutes'),
        started: true,
    }) as QuizExercise;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ArtemisTestModule, HttpClientTestingModule],
            declarations: [
                QuizParticipationComponent,
                MockComponent(AlertComponent),
                MockPipe(TranslatePipe),
                MockPipe(ArtemisDatePipe),
                MockDirective(JhiTranslateDirective),
                MockComponent(MultipleChoiceQuestionComponent),
                MockComponent(DragAndDropQuestionComponent),
                MockComponent(ShortAnswerQuestionComponent),
                MockComponent(ButtonComponent),
                MockComponent(JhiConnectionStatusComponent),
                MockDirective(NgbTooltip),
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ courseId: 1, exerciseId: quizExercise.id }),
                        data: of({ mode: 'live' }),
                    },
                },
                {
                    provide: LocalStorageService,
                    useClass: MockLocalStorageService,
                },
                {
                    provide: SessionStorageService,
                    useClass: MockSyncStorage,
                },
                {
                    provide: TranslateService,
                    useClass: MockTranslateService,
                },
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(QuizParticipationComponent);
                component = fixture.componentInstance;

                const injector = getTestBed();
                participationService = injector.get(QuizParticipationService);
                httpMock = injector.get(HttpTestingController);
            });
    });

    afterEach(function () {
        httpMock.verify();
        sinon.restore();
    });

    afterEach(fakeAsync(function () {
        discardPeriodicTasks();
    }));

    it('should initialize', () => {
        fixture.detectChanges();
        httpMock.expectOne({ method: 'GET' });
        expect(component).to.be.ok;
    });

    it('should fetch exercise and create a new submission', () => {
        fixture.detectChanges();
        const request = httpMock.expectOne({ method: 'GET' });
        request.flush({ exercise: quizExercise } as StudentParticipation);
        expect(request.request.url).to.equal(SERVER_API_URL + `api/exercises/${quizExercise.id}/participation`);

        fixture.detectChanges();

        expect(component.quizExercise).to.equal(quizExercise);
        expect(component.waitingForQuizStart).to.be.false;
        expect(component.totalScore).to.equal(6);
        expect(component.dragAndDropMappings.get(question1.id!)).to.deep.equal([]);
        expect(component.selectedAnswerOptions.get(question2.id!)).to.deep.equal([]);
        expect(component.shortAnswerSubmittedTexts.get(question3.id!)).to.deep.equal([]);
        expect(component.submission).to.be.ok;
    });

    it('should update in intervals', fakeAsync(() => {
        fixture.detectChanges();
        const request = httpMock.expectOne({ method: 'GET' });
        request.flush({ exercise: quizExercise } as StudentParticipation);

        const updateSpy = sinon.spy(component, 'updateDisplayedTimes');
        tick(5000);
        fixture.detectChanges();
        discardPeriodicTasks();

        expect(updateSpy).to.have.been.called;
    }));
});
