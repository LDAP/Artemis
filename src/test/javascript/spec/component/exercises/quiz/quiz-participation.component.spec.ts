import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

chai.use(sinonChai);
const expect = chai.expect;

describe('QuizParticipationComponent', () => {
    let fixture: ComponentFixture<QuizParticipationComponent>;
    let component: QuizParticipationComponent;
    let participationService: QuizParticipationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ArtemisTestModule],
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
                        params: of({ courseId: 1, exerciseId: 2 }),
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
                participationService = fixture.debugElement.injector.get(QuizParticipationService);
            });
    });

    afterEach(function () {
        sinon.restore();
    });

    it('should initialize', () => {
        fixture.detectChanges();
        expect(component).to.be.ok;
    });
});
